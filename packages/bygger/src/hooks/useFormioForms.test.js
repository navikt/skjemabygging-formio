import { getNodeText, render, screen, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { Formio } from "formiojs";
import fetchMock from "jest-fetch-mock";
import React, { useEffect, useState } from "react";
import { useFormioForms } from "./useFormioForms";

const RESPONSE_HEADERS_OK = {
  headers: {
    "content-type": "application/json",
  },
  status: 200,
};

const RESPONSE_HEADERS_ERROR = {
  headers: {
    "content-type": "text/plain",
  },
  status: 500,
};

describe("useFormioForms", () => {
  let userAlerter;

  beforeEach(() => {
    userAlerter = {
      flashSuccessMessage: jest.fn(),
      alertComponent: jest.fn(),
      setErrorMessage: jest.fn(),
    };
  });

  const TestComponent = ({ formio, formPath }) => {
    const { loadForm, loadFormsList } = useFormioForms(formio, userAlerter);
    const [forms, setForms] = useState([]);
    useEffect(() => {
      if (formPath) {
        loadForm(formPath).then((form) => setForms([form]));
      } else {
        loadFormsList().then((forms) => setForms(forms));
      }
    }, [formio, formPath, loadForm, loadFormsList]);
    return (
      <div>
        {forms.map((form, index) => (
          <div key={index} data-testid="form">
            {form.title}
          </div>
        ))}
      </div>
    );
  };

  describe("Test form", () => {
    beforeEach(() => {
      const forms = [
        { title: "skjema1", path: "skjema1", tags: "nav-skjema", properties: {}, modified: "", _id: "000" },
        { title: "skjema2", path: "skjema2", tags: "nav-skjema", properties: {}, modified: "", _id: "012" },
        { title: "skjema3", path: "skjema3", tags: "nav-skjema", properties: {}, modified: "", _id: "023" },
      ];

      const form = [
        { title: "skjema3", path: "skjema3", tags: "nav-skjema", properties: {}, modified: "", _id: "023" },
      ];
      fetchMock.mockImplementation((url) => {
        if (
          url.includes(
            "/form?type=form&tags=nav-skjema&limit=1000&select=title%2C%20path%2C%20tags%2C%20properties%2C%20modified%2C%20_id"
          )
        ) {
          return Promise.resolve(new Response(JSON.stringify(forms), RESPONSE_HEADERS_OK));
        } else if (url.includes("/form?type=form&tags=nav-skjema&path=skjema3&limit=1")) {
          return Promise.resolve(new Response(JSON.stringify(form), RESPONSE_HEADERS_OK));
        }
        return Promise.reject(new Error(`ukjent url ${url}`));
      });
    });

    it("loads form list in the hook", async () => {
      render(<TestComponent formio={new Formio("http://myproject.example.org")} />);
      const formDivs = await screen.findAllByTestId("form");
      expect(formDivs).toHaveLength(3);
      expect(getNodeText(formDivs[0])).toEqual("skjema1");
      expect(getNodeText(formDivs[1])).toEqual("skjema2");
      expect(getNodeText(formDivs[2])).toEqual("skjema3");
    });

    it("loads one specific form in the hook", async () => {
      render(<TestComponent formio={new Formio("http://myproject.example.org")} formPath="skjema3" />);
      const formDivs = await screen.findAllByTestId("form");
      expect(formDivs).toHaveLength(1);
      expect(getNodeText(formDivs[0])).toEqual("skjema3");
    });

    it("date update", async () => {
      render(<TestComponent formio={new Formio("http://myproject.example.org")} formPath="skjema3" />);
      const formDivs = await screen.findAllByTestId("form");
      expect(formDivs).toHaveLength(1);
      expect(getNodeText(formDivs[0])).toEqual("skjema3");
    });
  });

  describe("Test onSave", () => {
    let formioMock, formioForms;
    beforeEach(() => {
      formioMock = {
        saveForm: jest.fn().mockImplementation((form) => Promise.resolve(form)),
      };

      ({
        result: { current: formioForms },
      } = renderHook(() => useFormioForms(formioMock, userAlerter)));
    });

    it("add modified property onSave", async () => {
      renderHook(() => formioForms.onSave({}));

      expect(formioMock.saveForm).toHaveBeenCalled();
      expect(formioMock.saveForm.mock.calls[0][0]["properties"]).toHaveProperty("modified");
    });

    it("update modified property onSave", async () => {
      const modifiedDate = "2022-01-01T12:00:00.000Z";
      renderHook(() => formioForms.onSave({ modified: modifiedDate }));

      expect(formioMock.saveForm).toHaveBeenCalled();
      expect(formioMock.saveForm.mock.calls[0][0]["properties"]["modified"]).not.toBe(modifiedDate);
    });
  });

  describe("Test onPublish", () => {
    let formioMock, formioForms;

    beforeEach(() => {
      formioMock = {
        saveForm: jest.fn().mockImplementation((form) => Promise.resolve({ ...form, modified: Date.now() })),
      };

      ({
        result: { current: formioForms },
      } = renderHook(() => useFormioForms(formioMock, userAlerter)));
    });

    describe("when publishing succeeds", () => {
      beforeEach(() => {
        fetchMock.mockImplementation((url) => {
          if (url.endsWith("/api/publish/testform")) {
            return Promise.resolve(new Response(JSON.stringify({ changed: true }), RESPONSE_HEADERS_OK));
          }
          return Promise.reject(new Error(`ukjent url ${url}`));
        });
      });

      it("adds properties modified and published", async () => {
        renderHook(() => formioForms.onPublish({ path: "testform", properties: {} }));
        await waitFor(() => expect(userAlerter.flashSuccessMessage).toHaveBeenCalled());

        expect(formioMock.saveForm).toHaveBeenCalledTimes(1);
        expect(formioMock.saveForm.mock.calls[0][0]["properties"]).toHaveProperty("modified");
        expect(formioMock.saveForm.mock.calls[0][0]["properties"]).toHaveProperty("published");

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const publishedForm = JSON.parse(fetchMock.mock.calls[0][1].body).form;
        expect(publishedForm.properties.modified).toBeDefined();
        expect(publishedForm.properties.published).toBeDefined();
      });

      it("adds publishedLanguages to properties", async () => {
        const form = { path: "testform", properties: {} };
        const translations = { "no-NN": {}, en: {} };
        renderHook(() => formioForms.onPublish(form, translations));
        await waitFor(() => expect(userAlerter.flashSuccessMessage).toHaveBeenCalled());

        expect(formioMock.saveForm).toHaveBeenCalledTimes(1);
        const savedFormioForm = formioMock.saveForm.mock.calls[0][0];
        expect(savedFormioForm["properties"]).toHaveProperty("publishedLanguages");
        expect(savedFormioForm["properties"]["publishedLanguages"]).toEqual(["no-NN", "en"]);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const publishRequestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
        const publishedForm = publishRequestBody.form;
        expect(publishedForm.properties.publishedLanguages).toEqual(["no-NN", "en"]);
      });
    });

    describe("when publishing fails", () => {
      beforeEach(() => {
        fetchMock.mockImplementation((url) => {
          if (url.endsWith("/api/publish/testform")) {
            return Promise.resolve(new Response("500 Internal Server Error", RESPONSE_HEADERS_ERROR));
          }
          return Promise.reject(new Error(`ukjent url ${url}`));
        });
      });

      it("removes the published props and uses previous modified timestamp", async () => {
        const originalModifiedTimestamp = "2022-05-30T07:58:40.929Z";
        const form = {
          path: "testform",
          properties: {
            modified: originalModifiedTimestamp,
          },
        };
        const translations = { "no-NN": {}, en: {} };
        renderHook(() => formioForms.onPublish(form, translations));
        await waitFor(() => expect(userAlerter.setErrorMessage).toHaveBeenCalled());

        await waitFor(() => expect(formioMock.saveForm).toHaveBeenCalledTimes(2));

        const formBeforePublish = formioMock.saveForm.mock.calls[0][0];
        expect(formBeforePublish["properties"]).toHaveProperty("modified");
        expect(formBeforePublish["properties"]["modified"]).not.toEqual(originalModifiedTimestamp);
        expect(formBeforePublish["properties"]).toHaveProperty("published");
        expect(formBeforePublish["properties"]).toHaveProperty("publishedLanguages");

        const formAfterPublishFailure = formioMock.saveForm.mock.calls[1][0];
        expect(formAfterPublishFailure["properties"]).toHaveProperty("modified");
        expect(formAfterPublishFailure["properties"]["modified"]).toEqual(originalModifiedTimestamp);
        expect(formAfterPublishFailure["properties"]).not.toHaveProperty("published");
        expect(formAfterPublishFailure["properties"]).not.toHaveProperty("publishedLanguages");
      });

      it("rollbacks to previous published languages array", async () => {
        const originalModifiedTimestamp = "2022-05-30T07:58:40.929Z";
        const originalModifiedDate = Date.now();
        const form = {
          path: "testform",
          properties: {
            modified: originalModifiedTimestamp,
            publishedLanguages: ["en"],
          },
          modified: originalModifiedDate,
        };
        const translations = { "no-NN": {}, en: {} };
        renderHook(() => formioForms.onPublish(form, translations));
        await waitFor(() => expect(userAlerter.setErrorMessage).toHaveBeenCalled());

        await waitFor(() => expect(formioMock.saveForm).toHaveBeenCalledTimes(2));

        const formBeforePublish = formioMock.saveForm.mock.calls[0][0];
        expect(formBeforePublish["properties"]).toHaveProperty("publishedLanguages");
        expect(formBeforePublish["properties"]["publishedLanguages"]).toEqual(["no-NN", "en"]);

        const formAfterPublishFailure = formioMock.saveForm.mock.calls[1][0];
        expect(formAfterPublishFailure.modified.toString()).not.toEqual(originalModifiedDate.toString());
        expect(formAfterPublishFailure["properties"]).toHaveProperty("publishedLanguages");
        expect(formAfterPublishFailure["properties"]["publishedLanguages"]).toEqual(["en"]);
      });
    });
  });
});

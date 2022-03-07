import { getNodeText, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { Formio } from "formiojs";
import fetchMock from "jest-fetch-mock";
import React, { useEffect, useState } from "react";
import { useFormioForms } from "./useFormioForms";

const RESPONSE_HEADERS = {
  headers: {
    "content-type": "application/json",
  },
};

const userAlerter = {
  flashSuccessMessage: jest.fn(),
  alertComponent: jest.fn(),
  setErrorMessage: jest.fn(),
};

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

describe("useFormioForms", () => {
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
          return Promise.resolve(new Response(JSON.stringify(forms), RESPONSE_HEADERS));
        } else if (url.includes("/form?type=form&tags=nav-skjema&path=skjema3&limit=1")) {
          return Promise.resolve(new Response(JSON.stringify(form), RESPONSE_HEADERS));
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
        saveForm: jest.fn().mockImplementation((form) => Promise.resolve(form)),
      };

      ({
        result: { current: formioForms },
      } = renderHook(() => useFormioForms(formioMock, userAlerter)));
    });

    it("add modified property onPublish", async () => {
      renderHook(() => formioForms.onPublish({}));

      expect(formioMock.saveForm).toHaveBeenCalled();
      expect(formioMock.saveForm.mock.calls[0][0]["properties"]).toHaveProperty("modified");
      expect(formioMock.saveForm.mock.calls[0][0]["properties"]).toHaveProperty("published");
    });
  });
});

import { NavFormioJs } from "@navikt/skjemadigitalisering-shared-components";
import { getNodeText, render, screen, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { useEffect, useState } from "react";
import { AuthProvider } from "../context/auth-context";
import { FeedbackEmitContext } from "../context/notifications/FeedbackContext";
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

const USER_NAME = "Bond, James";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("useFormioForms", () => {
  let mockFeedbackEmit;

  beforeEach(() => {
    mockFeedbackEmit = { success: vi.fn(), error: vi.fn() };
  });

  afterEach(() => {
    fetchMock.mockClear();
  });

  const TestComponent = ({ formio, formPath }) => {
    const { loadForm, loadFormsList } = useFormioForms(formio);
    const [forms, setForms] = useState([]);
    useEffect(() => {
      if (formPath) {
        loadForm(formPath).then((form) => setForms([form]));
      } else {
        loadFormsList().then((forms) => setForms(forms));
      }
    }, [formio, formPath, loadForm, loadFormsList]);
    return (
      <AuthProvider user={{ name: USER_NAME }}>
        {forms.map((form, index) => (
          <div key={index} data-testid="form">
            {form.title}
          </div>
        ))}
      </AuthProvider>
    );
  };

  describe("Test form", () => {
    let formioFetch;
    beforeEach(() => {
      const forms = [
        { title: "skjema1", path: "skjema1", tags: "nav-skjema", properties: {}, modified: "", _id: "000" },
        { title: "skjema2", path: "skjema2", tags: "nav-skjema", properties: {}, modified: "", _id: "012" },
        { title: "skjema3", path: "skjema3", tags: "nav-skjema", properties: {}, modified: "", _id: "023" },
      ];

      const form = [
        { title: "skjema3", path: "skjema3", tags: "nav-skjema", properties: {}, modified: "", _id: "023" },
      ];
      formioFetch = vi.spyOn(NavFormioJs.Formio, "fetch");
      formioFetch.mockImplementation((url) => {
        if (
          url.includes(
            "/form?type=form&tags=nav-skjema&limit=1000&select=title%2C%20path%2C%20tags%2C%20properties%2C%20modified%2C%20_id",
          )
        ) {
          return Promise.resolve(new Response(JSON.stringify(forms), RESPONSE_HEADERS_OK));
        } else if (url.includes("/form?type=form&tags=nav-skjema&path=skjema3&limit=1")) {
          return Promise.resolve(new Response(JSON.stringify(form), RESPONSE_HEADERS_OK));
        }
        return Promise.reject(new Error(`ukjent url ${url}`));
      });
    });

    afterEach(() => {
      formioFetch.mockClear();
    });

    it("loads form list in the hook", async () => {
      render(<TestComponent formio={new NavFormioJs.Formio("http://myproject.example.org")} />);
      const formDivs = await screen.findAllByTestId("form");
      expect(formDivs).toHaveLength(3);
      expect(getNodeText(formDivs[0])).toBe("skjema1");
      expect(getNodeText(formDivs[1])).toBe("skjema2");
      expect(getNodeText(formDivs[2])).toBe("skjema3");
    });

    it("loads one specific form in the hook", async () => {
      render(<TestComponent formio={new NavFormioJs.Formio("http://myproject.example.org")} formPath="skjema3" />);
      const formDivs = await screen.findAllByTestId("form");
      expect(formDivs).toHaveLength(1);
      expect(getNodeText(formDivs[0])).toBe("skjema3");
    });

    it("date update", async () => {
      render(<TestComponent formio={new NavFormioJs.Formio("http://myproject.example.org")} formPath="skjema3" />);
      const formDivs = await screen.findAllByTestId("form");
      expect(formDivs).toHaveLength(1);
      expect(getNodeText(formDivs[0])).toBe("skjema3");
    });
  });

  describe("Test onSave", () => {
    let formioMock, formioForms;

    const wrapper = ({ children }) => <AuthProvider user={{ name: USER_NAME }}>{children}</AuthProvider>;

    beforeEach(() => {
      formioMock = {
        saveForm: vi.fn().mockImplementation((form) => Promise.resolve(form)),
      };

      ({
        result: { current: formioForms },
      } = renderHook(() => useFormioForms(formioMock), { wrapper }));
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

    it("adds navId to all components if missing", async () => {
      renderHook(() => formioForms.onSave({ components: [{}, { navId: "123", components: [{}] }] }));

      expect(formioMock.saveForm).toHaveBeenCalled();
      const savedComponents = formioMock.saveForm.mock.calls[0][0]["components"];
      expect(savedComponents).toHaveLength(2);
      expect(savedComponents[0].navId).toBeDefined();
      expect(savedComponents[1].navId).toBe("123");
      expect(savedComponents[1].components).toHaveLength(1);
      expect(savedComponents[1].components[0].navId).toBeDefined();
    });
  });

  describe("Test onPublish and onUnpublish", () => {
    let formioMock, formioForms;

    const createDate = (dateDiff = 0) => {
      const date = new Date();
      date.setDate(date.getDate() + dateDiff);
      return date;
    };

    const wrapper = ({ children }) => (
      <AuthProvider user={{ name: USER_NAME }}>
        <FeedbackEmitContext.Provider value={mockFeedbackEmit}>{children}</FeedbackEmitContext.Provider>
      </AuthProvider>
    );

    beforeEach(() => {
      formioMock = {
        saveForm: vi.fn().mockImplementation((form) => Promise.resolve({ ...form, modified: createDate() })),
        loadForms: vi.fn().mockImplementation((path) => Promise.resolve([{ path, modified: createDate() }])),
      };

      ({
        result: { current: formioForms },
      } = renderHook(() => useFormioForms(formioMock), { wrapper }));
    });

    describe("when publishing succeeds", () => {
      beforeEach(() => {
        fetchMock.mockImplementation((url) => {
          if (url.endsWith("/api/published-forms/testform")) {
            return Promise.resolve(new Response(JSON.stringify({ changed: true, form: {} }), RESPONSE_HEADERS_OK));
          }
          return Promise.reject(new Error(`ukjent url ${url}`));
        });
      });

      it("flashes success message", async () => {
        renderHook(() => formioForms.onPublish({ path: "testform", properties: {} }));
        await waitFor(() => expect(mockFeedbackEmit.success).toHaveBeenCalled());
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it("sends form content and published languages array in request", async () => {
        const form = { path: "testform", properties: {} };
        const translations = { "no-NN": {}, en: {} };
        renderHook(() => formioForms.onPublish(form, translations));
        await waitFor(() => expect(mockFeedbackEmit.success).toHaveBeenCalled());

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const publishRequestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
        const publishedForm = publishRequestBody.form;
        const publishedTranslations = publishRequestBody.translations;
        expect(publishedForm).toEqual(form);
        expect(publishedTranslations).toEqual(translations);
      });
    });

    describe("when publishing fails", () => {
      beforeEach(() => {
        fetchMock.mockImplementation((url) => {
          if (url.endsWith("/api/published-forms/testform")) {
            return Promise.resolve(
              new Response(JSON.stringify({ message: "Publisering feilet" }), RESPONSE_HEADERS_ERROR),
            );
          }
          return Promise.reject(new Error(`ukjent url ${url}`));
        });
      });

      it("flashes error message and loads form from formio-api", async () => {
        const originalModifiedTimestamp = "2022-05-30T07:58:40.929Z";
        const form = {
          path: "testform",
          properties: {
            modified: originalModifiedTimestamp,
          },
        };
        const translations = { "no-NN": {}, en: {} };
        renderHook(() => formioForms.onPublish(form, translations));
        await waitFor(() => expect(mockFeedbackEmit.error).toHaveBeenCalled());
        await waitFor(() => expect(formioMock.loadForms).toHaveBeenCalledTimes(1));
      });
    });

    describe("when unpublishing succeeds", () => {
      beforeEach(() => {
        fetchMock.mockImplementation((url) => {
          if (url.endsWith("/api/published-forms/testform")) {
            return Promise.resolve(new Response(JSON.stringify({ changed: true, form: {} }), RESPONSE_HEADERS_OK));
          }
          return Promise.reject(new Error(`ukjent url ${url}`));
        });
      });

      it("flashes success message", async () => {
        renderHook(() => formioForms.onUnpublish({ path: "testform", properties: {} }));
        await waitFor(() => expect(mockFeedbackEmit.success).toHaveBeenCalled());
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });

    describe("when unpublishing fails", () => {
      beforeEach(() => {
        fetchMock.mockImplementation((url) => {
          if (url.endsWith("/api/published-forms/testform")) {
            return Promise.resolve(
              new Response(JSON.stringify({ message: "Avpublisering feilet" }), RESPONSE_HEADERS_ERROR),
            );
          }
          return Promise.reject(new Error(`ukjent url ${url}`));
        });
      });

      it("flashes error message and loads form from formio-api", async () => {
        const originalModifiedTimestamp = "2022-05-30T07:58:40.929Z";
        const form = {
          path: "testform",
          properties: {
            modified: originalModifiedTimestamp,
          },
        };
        renderHook(() => formioForms.onUnpublish(form));
        await waitFor(() => expect(mockFeedbackEmit.error).toHaveBeenCalled());
        await waitFor(() => expect(formioMock.loadForms).toHaveBeenCalledTimes(1));
      });
    });
  });
});

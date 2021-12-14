import { renderHook } from "@testing-library/react-hooks";
import Formiojs from "formiojs/Formio";
import fetchMock from "jest-fetch-mock";
import { useFormioForms } from "./useFormioForms";

const RESPONSE_HEADERS = {
  headers: {
    "content-type": "application/json",
  },
};

describe("useFormioForms", () => {
  const forms = [
    { title: "skjema1", path: "skjema1", tags: "nav-skjema", properties: {}, modified: "", _id: "000" },
    { title: "skjema2", path: "skjema2", tags: "nav-skjema", properties: {}, modified: "", _id: "012" },
    { title: "skjema3", path: "skjema3", tags: "nav-skjema", properties: {}, modified: "", _id: "023" },
  ];

  const form = [{ title: "skjema3", path: "skjema3", tags: "nav-skjema", properties: {}, modified: "", _id: "023" }];
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

  it("loads form list in the hook", async () => {
    const { result } = renderHook(() => useFormioForms(new Formiojs("http://myproject.example.org")));
    const forms = await result.current.loadFormsList();
    expect(forms.length).toBe(3);
    expect(forms[0].title).toBe("skjema1");
    expect(forms[1].title).toBe("skjema2");
    expect(forms[2].title).toBe("skjema3");
  });

  it("loads one specific form in the hook", async () => {
    const { result } = renderHook(() => useFormioForms(new Formiojs("http://myproject.example.org")));
    const form = await result.current.loadForm("skjema3");
    expect(form.title).toBe("skjema3");
  });
});

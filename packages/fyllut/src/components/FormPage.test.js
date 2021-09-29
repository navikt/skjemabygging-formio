import React from "react";
import { render } from "@testing-library/react";
import FormPage from "./FormPage";

describe("FormPage", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockReturnValue(Promise.resolve({ json: jest.fn() }));
    render(<FormPage form={{ path: "formPath", title: "Form title" }} />);
  });

  afterEach(() => {
    global.fetch.mockClear();
  });

  it('calls "/fyllut/translations/formPath"', () => {
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith("/fyllut/translations/formPath", {
      headers: { accept: "application/json" },
    });
  });
});

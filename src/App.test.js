import { FakeBackendTestContext } from "./testTools/FakeBackendTestContext";
import { Formio } from "formiojs";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { renderHook } from "@testing-library/react-hooks";
import Form from "./react-formio/Form.jsx";
import { useForms } from "./useForms";
import { AuthContext } from "./context/auth-context";
import App from "./App";
import Formiojs from "formiojs/Formio";

const context = new FakeBackendTestContext();
context.setupBeforeAfter();

describe("App", () => {
  let oldFormioFetch;
  let formStore;
  beforeEach(() => {
    oldFormioFetch = Formio.fetch;
    Formio.fetch = global.fetch;
    formStore = { forms: [] };
  });
  afterEach(() => {
    Formio.fetch = oldFormioFetch;
  });

  it("baseURL renders loginform when unauthenticated", async () => {
    let formElement;
    context.render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthContext.Provider value={{ userData: null, login: () => {}, logout: () => {} }}>
          <App store={formStore} projectURL="http://myproject.example.org" />
        </AuthContext.Provider>
      </MemoryRouter>,
      {
        createNodeMock: element => {
          if (element.props["data-testid"] === "formMountElement") {
            formElement = document.createElement("div");
            return formElement;
          }
        }
      }
    );
    await context.waitForComponent(Form); // Misvisende - must investigate
    expect(formElement.querySelectorAll("label")).toHaveLength(2);
    expect(formElement.querySelectorAll("label")[0].textContent.trim()).toEqual("Email");
  });

  it("loads all forms in the hook", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useForms(new Formiojs("http://myproject.example.org"), formStore));
    expect(formStore.forms).toEqual([]);
    await waitForNextUpdate();
    expect(result.current.forms).toEqual(context.backend.allForms);
    expect(context.backend.allForms).toEqual(formStore.forms);
  });
});

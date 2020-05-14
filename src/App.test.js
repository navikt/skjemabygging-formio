import {FakeBackendTestContext} from "./FakeBackendTestContext";
import {Formio} from "formiojs";
import React from "react";
import App, {useFormio} from "./App";
import {MemoryRouter} from "react-router-dom";
import {renderHook, act} from "@testing-library/react-hooks";
import form from "./react-formio/json/Form.json";
import waitForExpect from "wait-for-expect";
import Form from "./react-formio/Form.jsx";

const context = new FakeBackendTestContext();
context.setupBeforeAfter();

describe("App", () => {
  let oldFormioFetch;
  beforeEach(() => {
    oldFormioFetch = Formio.fetch;
    Formio.fetch = global.fetch;
  });
  afterEach(() => {
    Formio.fetch = oldFormioFetch;
  });

  it('loads all the forms using REST', async () => {
    let formElement;
    context.render(<MemoryRouter initialEntries={["/"]}>
        <App projectURL="http://myproject.example.org"></App>
      </MemoryRouter>,
      {
        createNodeMock: element => {
          if (element.props["data-testid"] === "formMountElement") {
            formElement = document.createElement("div");
            return formElement;
          }
        }
      });
    const loginForm = await context.waitForComponent(Form);
    // burde være lastet her
    context.act(() => {
      loginForm.props.onSubmitDone()
    });
    const memoryRouter = context.testRenderer.root.findByType(MemoryRouter);
    expect(memoryRouter.instance.history.location.pathname).toEqual('/forms');
    const linkList = await context.waitForComponent('ul');
    const lis = linkList.findAllByType('li');
    expect(lis).toHaveLength(1);
  });

  it("baseURL renders loginform when unauthenticated", async () => {
    let formElement;
    context.render(
      <MemoryRouter initialEntries={["/"]}>
        <App projectURL="http://myproject.example.org"/>
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

  it("loads the form in the hook", async () => {
    const {result, waitForNextUpdate} = renderHook(() => useFormio("http://myproject.example.org"));
    expect(result.current.authenticated).toBeFalsy();
    act(() => {
      result.current.setAuthenticated(true);
    });
    expect(result.current.authenticated).toBeTruthy();
    await waitForNextUpdate();
    expect(result.current.forms).toEqual([form]);
  });
});

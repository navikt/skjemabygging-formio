import {FakeBackendTestContext} from "./testTools/FakeBackendTestContext";
import {Formio} from "formiojs";
import React from "react";
import App, {useFormio} from "./App";
import {Link, MemoryRouter} from "react-router-dom";
import {renderHook, act} from "@testing-library/react-hooks";
import form from "./testTools/json/Form.json";
import waitForExpect from "wait-for-expect";
import Form from "./react-formio/Form.jsx";
import NavFormBuilder from "./components/NavFormBuilder";

const context = new FakeBackendTestContext();
context.setupBeforeAfter();

const testRendererOptions = {
  createNodeMock: element => {
    if (["formMountElement", 'builderMountElement'].includes(element.props["data-testid"])) {
      return document.createElement("div");
    }
    return null;
  }
}

describe("App", () => {
  let oldFormioFetch;
  let formStore;
  beforeEach(() => {
    oldFormioFetch = Formio.fetch;
    Formio.fetch = global.fetch;
    formStore = {forms: []};
  });
  afterEach(() => {
    Formio.fetch = oldFormioFetch;
  });

  it('lets you edit and save a form', async () => {
    let formElement;
    context.render(<MemoryRouter initialEntries={["/"]}>
        <App store={formStore} projectURL="http://myproject.example.org"></App>
      </MemoryRouter>,
      testRendererOptions);
    const loginForm = await context.waitForComponent(Form);
    // burde være lastet her
    context.act(() => {
      loginForm.props.onSubmitDone()
    });
    const memoryRouter = context.testRenderer.root;
    expect(memoryRouter.instance.history.location.pathname).toEqual('/forms');
    const linkList = await context.waitForComponent('ul');
    expect(formStore.forms).toHaveLength(1);
    const links = linkList.findAllByType(Link);
    context.act(() => memoryRouter.instance.history.push(links[0].props.to));
    expect(memoryRouter.instance.history.location.pathname).toEqual('/forms/debugskjema/edit');
    const formBuilder = memoryRouter.findByType(NavFormBuilder);
    jest.useRealTimers();
    await waitForExpect(() => expect(formBuilder.instance.builder.form).toEqual(context.backend.form()));
    expect(formBuilder.instance.builder.form).toEqual(formStore.forms[0]);
    expect(formBuilder.instance.builderState).toEqual('ready');
    jest.useFakeTimers();
    context.act(() => jest.runAllTimers());
    context.testRenderer.unmount();
    await waitForExpect(() => expect(formBuilder.instance.builderState).toEqual('destroyed'));
  });

  it('loads all the forms using REST', async () => {
    const formStore = {forms: []};
    context.render(<MemoryRouter initialEntries={["/"]}>
        <App projectURL="http://myproject.example.org" store={formStore}></App>
      </MemoryRouter>,
      testRendererOptions);
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
    const store = {forms: []};
    let formElement;
    context.render(
      <MemoryRouter initialEntries={["/"]}>
        <App
          store={store}
          projectURL="http://myproject.example.org"/>
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
    const store = {forms: []};
    const {result, waitForNextUpdate} = renderHook(() => useFormio("http://myproject.example.org", store));
    expect(result.current.authenticated).toBeFalsy();
    act(() => {
      result.current.setAuthenticated(true);
    });
    expect(result.current.authenticated).toBeTruthy();
    await waitForNextUpdate();
    expect(result.current.forms).toEqual([form]);
    expect(result.current.forms).toEqual(store.forms);
  });
});

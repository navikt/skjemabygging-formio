import {FakeBackendTestContext} from "./testTools/FakeBackendTestContext";
import {Formio} from "formiojs";
import React from "react";
import App from "./App";
import {Link, MemoryRouter} from "react-router-dom";
import {renderHook, act} from "@testing-library/react-hooks";
import form from "./testTools/json/Form.json";
import waitForExpect from "wait-for-expect";
import Form from "./react-formio/Form.jsx";
import NavFormBuilder from "./components/NavFormBuilder";
import {Hovedknapp} from "nav-frontend-knapper";
import {FormMetadataEditor} from "./components/FormMetadataEditor";
import NewFormPage from "./components/NewFormPage";
import {useFormio} from "./useFormio";

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

  it('lets you create a new form', async () => {
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
    const lagNyttSkjemaKnapp = context.testRenderer.root.findByType(Hovedknapp);
    expect(lagNyttSkjemaKnapp.props.children).toEqual('Lag nytt skjema');
    context.act(() => lagNyttSkjemaKnapp.props.onClick());
    // check navigate to /forms/new
    expect(memoryRouter.instance.history.location.pathname).toEqual('/forms/new');

    const newFormPage = context.testRenderer.root.findByType(NewFormPage);
    newFormPage.findByProps({id: 'title'}).props.onChange({target: {value: 'Meat'}});
    newFormPage.findByProps({id: 'name'}).props.onChange({target: {value: 'meat'}});
    newFormPage.findByProps({id: 'form-display'}).props.onChange({target: {value: 'Suppe'}});
    newFormPage.findByProps({id: 'path'}).props.onChange({target: {value: 'sykkel'}});
    newFormPage.findByProps({id: 'form-type'}).props.onChange({target: {value: 'Trehjulsykkel'}});

    expect(newFormPage.instance.state.form).toMatchObject({
      type: 'Trehjulsykkel',
      path: 'sykkel',
      display: 'Suppe',
      name: 'meat',
      title: 'Meat',
      tags: ['nav-skjema']
    });
    // click save/create/next form button
    const createButton = newFormPage.findByType(Hovedknapp);
    expect(createButton.props.children).toEqual('Opprett');
    expect(context.backend.hasFormByPath('sykkel')).toBeFalsy();
    context.act(() => createButton.props.onClick());
    // check that form is saved to backend
    expect(context.backend.hasFormByPath('sykkel')).toBeTruthy();
    // check that we have navigated to edit form for the new form
    expect(memoryRouter.instance.history.location.pathname).toEqual('/forms/sykkel/edit');
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

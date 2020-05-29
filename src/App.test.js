import { FakeBackendTestContext } from "./testTools/FakeBackendTestContext";
import { Formio } from "formiojs";
import React from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import { Link, MemoryRouter } from "react-router-dom";
import { renderHook, act } from "@testing-library/react-hooks";
import waitForExpect from "wait-for-expect";
import Form from "./react-formio/Form.jsx";
import NavFormBuilder from "./components/NavFormBuilder";
import { Hovedknapp } from "nav-frontend-knapper";
import NewFormPage from "./components/NewFormPage";
import { useFormio } from "./useFormio";
import { AuthContext } from "./context/auth-context";
import App from "./App";

const context = new FakeBackendTestContext();
context.setupBeforeAfter();

const testRendererOptions = {
  createNodeMock: element => {
    if (["formMountElement", "builderMountElement"].includes(element.props["data-testid"])) {
      return document.createElement("div");
    }
    return null;
  }
};

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

  function routeLocation() {
    const memoryRouter = context.testRenderer.root;
    return memoryRouter.instance.history.location;
  }

  function renderApp(pathname) {
    return context.render(
      <MemoryRouter initialEntries={[pathname]}>
        <AuthContext.Provider value={{ userData: "fakeUser", login: () => {}, logout: () => {} }}>
          <AuthenticatedApp store={formStore} projectURL="http://myproject.example.org"/>
        </AuthContext.Provider>
      </MemoryRouter>,
      testRendererOptions
    );
  }

  function formLinks() {
    const linkList = context.testRenderer.root.findByType("ul");
    return linkList.findAllByType(Link);
  }

  function clickHovedknapp(title) {
    const knapp = context.testRenderer.root.findByType(Hovedknapp);
    expect(knapp.props.children).toEqual(title);
    context.act(() => knapp.props.onClick());
  }

  function navigateTo(path) {
    const memoryRouter = context.testRenderer.root;
    context.act(() => memoryRouter.instance.history.push(path));
  }

  it('lets you navigate to new form page from the list of all forms', async () => {
    renderApp('/forms');
    clickHovedknapp("Lag nytt skjema");
    expect(routeLocation().pathname).toEqual("/forms/new");
    await context.waitForComponent(NewFormPage);
  });

  it("lets you create a new form", async () => {
    renderApp('/forms/new');
    const newFormPage = context.testRenderer.root.findByType(NewFormPage);
    newFormPage.findByProps({ id: "title" }).props.onChange({ target: { value: "Meat" } });
    expect(newFormPage.instance.state.form).toMatchObject({
      type: "form",
      path: "meat",
      display: "form",
      name: "meat",
      title: "Meat",
      tags: ["nav-skjema"]
    });
    await waitForExpect(() => expect(formStore.forms).toHaveLength(1));
    expect(context.backend.hasFormByPath("meat")).toBeFalsy();
    clickHovedknapp("Opprett");
    jest.useRealTimers();
    await waitForExpect(() => expect(context.backend.hasFormByPath("meat")).toBeTruthy());
    jest.useFakeTimers();
    expect(formStore.forms).toHaveLength(2);
    expect(routeLocation().pathname).toEqual("/forms/meat/edit");
    const formBuilder = context.testRenderer.root.findByType(NavFormBuilder);
    await waitForExpect(() => expect(formBuilder.instance.builderState).toEqual("ready"));
    expect(formBuilder.instance.builder.form).toMatchObject(context.backend.formByPath("meat"));
  });

  it('can edit a form', async () => {
    renderApp('/forms/debugskjema/edit');
    setTimeout.mock.calls[0][0]();
    const formBuilder = await context.waitForComponent(NavFormBuilder);
    jest.runAllTimers();
    await waitForExpect(() => expect(formBuilder.instance.builder.form).toEqual(context.backend.form()));
    expect(formBuilder.instance.builder.form).toEqual(formStore.forms[0]);
    expect(formBuilder.instance.builderState).toEqual("ready");
    context.testRenderer.unmount();
    await waitForExpect(() => expect(formBuilder.instance.builderState).toEqual("destroyed"));
  });

  it("lets navigate from the list to the editor", async () => {
    renderApp('/forms');
    setTimeout.mock.calls[0][0]();
    await waitForExpect(() => expect(formStore.forms).toHaveLength(1));
    const links = formLinks();
    navigateTo(links[0].props.to);
    const formBuilder = context.testRenderer.root.findByType(NavFormBuilder);
    jest.useRealTimers();
    await waitForExpect(() => expect(formBuilder.instance.builder.form).toEqual(context.backend.form()));
    jest.useFakeTimers();
  });

  it("displays all the forms with an edit link", async () => {
    renderApp('/forms');
    setTimeout.mock.calls[0][0]();
    await waitForExpect(() => expect(formLinks()).toHaveLength(1));
    const editorPath = formLinks()[0].props.to;
    expect(editorPath).toEqual("/forms/debugskjema/edit");
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
    const { result, waitForNextUpdate } = renderHook(() => useFormio("http://myproject.example.org", formStore));
    expect(formStore.forms).toEqual([]);
    await waitForNextUpdate();
    expect(result.current.forms).toEqual(context.backend.allForms);
    expect(context.backend.allForms).toEqual(formStore.forms);
  });
});

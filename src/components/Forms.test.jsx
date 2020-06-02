import NewFormPage from "./NewFormPage";
import NavFormBuilder from "./NavFormBuilder";
import waitForExpect from "wait-for-expect";
import {FakeBackendTestContext} from "../testTools/FakeBackendTestContext";
import {Link, MemoryRouter} from "react-router-dom";
import {AuthContext} from "../context/auth-context";
import AuthenticatedApp from "../AuthenticatedApp";
import React from "react";
import {Formio} from "formiojs";
import {Hovedknapp} from "nav-frontend-knapper";

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

describe('Forms', () => {
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

  function editFormLinks() {
    const linkList = context.testRenderer.root.findByType("ul");
    const lis = linkList.findAllByType('li');
    return lis.map(li => li.findByProps({'data-testid': 'editLink'}));
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
    const links = editFormLinks();
    navigateTo(links[0].props.to);
    const formBuilder = context.testRenderer.root.findByType(NavFormBuilder);
    jest.useRealTimers();
    await waitForExpect(() => expect(formBuilder.instance.builder.form).toEqual(context.backend.form()));
    jest.useFakeTimers();
  });

  it("displays all the forms with an edit link", async () => {
    renderApp('/forms');
    setTimeout.mock.calls[0][0]();
    await waitForExpect(() => expect(editFormLinks()).toHaveLength(1));
    const editorPath = editFormLinks()[0].props.to;
    expect(editorPath).toEqual("/forms/debugskjema/edit");
  });
});
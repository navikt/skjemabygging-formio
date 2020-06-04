import NewFormPage from "./NewFormPage";
import waitForExpect from "wait-for-expect";
import NavFormBuilder from "./NavFormBuilder";
import {Formio} from "formiojs";
import {Link, MemoryRouter} from "react-router-dom";
import {AuthContext} from "../context/auth-context";
import AuthenticatedApp from "../AuthenticatedApp";
import {Hovedknapp} from "nav-frontend-knapper";
import React from "react";
import {FakeBackendTestContext} from "../testTools/FakeBackendTestContext";

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

describe('NewFormPage', () => {
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
          <AuthenticatedApp flashTheMessage={jest.fn()} store={formStore} formio={new Formio("http://myproject.example.org")}/>
        </AuthContext.Provider>
      </MemoryRouter>,
      testRendererOptions
    );
  }

  function clickHovedknapp(title) {
    const knapp = context.testRenderer.root.findByType(Hovedknapp);
    expect(knapp.props.children).toEqual(title);
    context.act(() => knapp.props.onClick());
  }

  it("lets you create a new form", async () => {
    renderApp('/forms/new');
    const newFormPage = context.testRenderer.root.findByType(NewFormPage);
    newFormPage.findByProps({id: "title"}).props.onChange({target: {value: "Meat"}});
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
});

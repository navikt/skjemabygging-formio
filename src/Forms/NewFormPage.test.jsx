import NewFormPage from "./NewFormPage";
import waitForExpect from "wait-for-expect";
import NavFormBuilder from "../components/NavFormBuilder";
import { Formio } from "formiojs";
import { Link, MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import AuthenticatedApp from "../AuthenticatedApp";
import { Hovedknapp } from "nav-frontend-knapper";
import React from "react";
import { FakeBackendTestContext } from "../testTools/frontend/FakeBackendTestContext";
import { UserAlerterContext } from "../userAlerting";

const context = new FakeBackendTestContext();
context.setupBeforeAfter();

const testRendererOptions = {
  createNodeMock: (element) => {
    if (["formMountElement", "builderMountElement"].includes(element.props["data-testid"])) {
      return document.createElement("div");
    }
    return null;
  },
};

describe("NewFormPage", () => {
  let oldFormioFetch;
  let formStore;
  beforeEach(() => {
    oldFormioFetch = Formio.fetch;
    Formio.fetch = global.fetch;
    formStore = { forms: null };
  });
  afterEach(() => {
    Formio.fetch = oldFormioFetch;
  });

  function routeLocation() {
    const memoryRouter = context.testRenderer.root;
    return memoryRouter.instance.history.location;
  }

  function renderApp(pathname) {
    const userAlerter = { flashSuccessMessage: jest.fn(), alertComponent: jest.fn() };
    return context.render(
      <MemoryRouter initialEntries={[pathname]}>
        <AuthContext.Provider
          value={{
            userData: "fakeUser",
            login: () => {},
            logout: () => {},
          }}
        >
          <UserAlerterContext.Provider value={userAlerter}>
            <AuthenticatedApp store={formStore} formio={new Formio("http://myproject.example.org")} />
          </UserAlerterContext.Provider>
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
    renderApp("/forms/new");
    // internal react timer
    expect(setTimeout.mock.calls).toHaveLength(1);
    jest.runOnlyPendingTimers();
    const newFormPage = await context.waitForComponent(NewFormPage);
    newFormPage.findByProps({ id: "title" }).props.onChange({ target: { value: "Meat" } });
    expect(newFormPage.instance.state.form).toMatchObject({
      type: "form",
      path: "meat",
      display: "wizard",
      name: "meat",
      title: "Meat",
      tags: ["nav-skjema", ""],
    });
    await waitForExpect(() => expect(formStore.forms).toHaveLength(2));
    expect(context.backend.hasFormByPath("meat")).toBeFalsy();
    clickHovedknapp("Opprett");
    await waitForExpect(() => expect(context.backend.hasFormByPath("meat")).toBeTruthy());
    expect(formStore.forms).toHaveLength(3);
    expect(routeLocation().pathname).toEqual("/forms/meat/edit");
    const formBuilder = context.testRenderer.root.findByType(NavFormBuilder);
    jest.runAllTimers();
    await waitForExpect(() => expect(formBuilder.instance.builderState).toEqual("ready"));
    expect(formBuilder.instance.builder.form).toMatchObject(context.backend.formByPath("meat"));
  });
});

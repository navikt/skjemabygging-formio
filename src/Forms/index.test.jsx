import NewFormPage from "./NewFormPage";
import NavFormBuilder, { UnstyledNavFormBuilder } from "../components/NavFormBuilder";
import waitForExpect from "wait-for-expect";
import { FakeBackendTestContext } from "../testTools/frontend/FakeBackendTestContext";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import AuthenticatedApp from "../AuthenticatedApp";
import React from "react";
import { Formio } from "formiojs";
import { Hovedknapp } from "nav-frontend-knapper";
import { FormMetadataEditor } from "../components/FormMetadataEditor";
import { UserAlerterContext } from "../userAlerting";
import { AppConfigProvider } from "../configContext";
import featureToggles from "../featureToggles.json";
import { FormsListPage } from "./FormsListPage";

const context = new FakeBackendTestContext();
context.setupBeforeAfter();

describe("FormsRouter", () => {
  const testRendererOptions = {
    createNodeMock: (element) => {
      if (["formMountElement", "builderMountElement"].includes(element.props["data-testid"])) {
        return htmlDivElement;
      }
      return null;
    },
  };

  let oldFormioFetch;
  let formStore;
  let htmlDivElement;
  beforeEach(() => {
    oldFormioFetch = Formio.fetch;
    Formio.fetch = global.fetch;
    formStore = { forms: null };
    htmlDivElement = document.createElement("div");
    document.body.appendChild(htmlDivElement);
  });
  afterEach(() => {
    Formio.fetch = oldFormioFetch;
    document.body.removeChild(htmlDivElement);
    htmlDivElement.outerHTML = "";
  });

  function routeLocation() {
    const memoryRouter = context.testRenderer.root;
    return memoryRouter.instance.history.location;
  }

  function renderApp(pathname) {
    const userAlerter = {
      flashSuccessMessage: jest.fn(),
      alertComponent: jest.fn(),
    };
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
            <AppConfigProvider featureToggles={featureToggles}>
              <AuthenticatedApp store={formStore} formio={new Formio("http://myproject.example.org")} />
            </AppConfigProvider>
          </UserAlerterContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
      testRendererOptions
    );
  }

  function editFormLinks() {
    const linkList = context.testRenderer.root.findByType("ul");
    const lis = linkList.findAllByType("li");
    return lis.map((li) => li.findAllByProps({ "data-testid": "editLink" }));
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

  it("lets you navigate to new form page from the list of all forms", async () => {
    renderApp("/forms");
    expect(setTimeout.mock.calls).toHaveLength(1);
    jest.runOnlyPendingTimers();
    await context.waitForComponent(FormsListPage);
    clickHovedknapp("Lag nytt skjema");
    expect(routeLocation().pathname).toEqual("/forms/new");
    await context.waitForComponent(NewFormPage);
  });

  //const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const buildComponent = (builder, type, container) => {
    // Get the builder sidebar component.
    const webformBuilder = builder.instance;
    let builderGroup = null;
    let groupName = "";
    Object.entries(webformBuilder.groups).forEach(([key, group]) => {
      if (group.components[type]) {
        groupName = key;
        return false;
      }
    });

    if (!groupName) {
      return;
    }
    const openedGroup = document.getElementById(`group-${groupName}"`);
    if (openedGroup) {
      openedGroup.classList.remove("in");
    }
    const group = document.getElementById(`group-${groupName}`);
    group && group.classList.add("in");

    let component = webformBuilder.element.querySelector(`span[data-type='${type}']`);
    if (component) {
      component = component && component.cloneNode(true);
      const element = container || webformBuilder.element.querySelector(".drag-container.formio-builder-form");
      element.appendChild(component);
      builderGroup = document.getElementById(`group-container-${groupName}`);
      webformBuilder.onDrop(component, element, builderGroup);
    } else {
      return;
    }

    return webformBuilder;
  };

  const saveComponent = (builder) => {
    const click = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    const saveBtn = builder.instance.componentEdit.querySelector('[ref="saveButton"]');
    if (saveBtn) {
      saveBtn.dispatchEvent(click);
    }
  };

  xit("crashes when editing a second time", async () => {
    renderApp("/forms/columns/edit");
    setTimeout.mock.calls[0][0]();
    let navFormBuilder = await context.waitForComponent(NavFormBuilder);
    jest.runAllTimers();
    // her må vi vente til formbuilderen er ready
    await waitForExpect(() => expect(navFormBuilder.instance.builderState).toEqual("ready"));
    const formioJsBuilder = navFormBuilder.instance.builder;
    const column1 = htmlDivElement.querySelector('[ref="columns-container"]');
    buildComponent(formioJsBuilder, "textfield", column1);
    jest.advanceTimersByTime(150);
    saveComponent(formioJsBuilder);
    jest.advanceTimersByTime(150);
    const columns = formioJsBuilder.instance.webform.getComponent("columns");
    expect(columns.columns[0]).toHaveLength(1);
    context.testRenderer.root.instance.history.push("/forms/columns/view");
    //// sjekk at navigasjon er ferdig
    //// naviger tilbake til edit
    context.testRenderer.root.instance.history.push("/forms/columns/edit");
    jest.clearAllTimers(); //må cleare før vi kan kjøre igjen!
    navFormBuilder = await context.waitForComponent(NavFormBuilder);
    jest.runAllTimers();
    //// her må vi vente til formbuilderen er ready
    await waitForExpect(() => expect(navFormBuilder.instance.builderState).toEqual("ready"));
    jest.clearAllTimers();
    // prøv å legg til et felt en gang til og se at det griser seg
  });

  it("can edit a form", async () => {
    renderApp("/forms/debugskjema/edit");
    setTimeout.mock.calls[0][0]();
    const formBuilder = await context.waitForComponent(UnstyledNavFormBuilder);
    jest.runAllTimers();
    await waitForExpect(() => expect(formBuilder.instance.builder.form).toEqual(context.backend.form()));
    expect(formBuilder.instance.builder.form).toEqual(formStore.forms[1]);
    expect(formBuilder.instance.builderState).toEqual("ready");
    context.testRenderer.unmount();
    await waitForExpect(() => expect(formBuilder.instance.builderState).toEqual("destroyed"));
  });

  it("lets navigate from the list to the editor", async () => {
    renderApp("/forms");
    setTimeout.mock.calls[0][0]();
    await waitForExpect(() => expect(formStore.forms).toHaveLength(2));
    const links = editFormLinks()[2];
    navigateTo(links[0].props.to);
    const formBuilder = await context.waitForComponent(UnstyledNavFormBuilder);
    jest.runAllTimers();
    await waitForExpect(() => expect(formBuilder.instance.builder.form).toEqual(context.backend.form()));
    expect(formBuilder.instance.builderState).toEqual("ready");
  });

  it("displays all the forms with an edit link", async () => {
    renderApp("/forms");
    setTimeout.mock.calls[0][0]();
    await waitForExpect(() => expect(editFormLinks()).toHaveLength(3));
    const editorPath = editFormLinks()[2][0].props.to;
    console.log(editorPath);
    expect(editorPath).toEqual("/forms/debugskjema/edit");
  });

  xit("testtest formbuilder", async () => {
    context.render(
      <MemoryRouter initialEntries={[`/forms/${context.backend.form().path}/edit`]}>
        <AuthContext.Provider
          value={{
            userData: "fakeUser",
            login: () => {},
            logout: () => {},
          }}
        >
          <AuthenticatedApp
            formio={{}}
            store={{ forms: [context.backend.form()] }}
            userAlerter={{ flashSuccessMessage: jest.fn() }}
          />
        </AuthContext.Provider>
      </MemoryRouter>,
      testRendererOptions
    );
    const formMetadataEditor = await context.waitForComponent(FormMetadataEditor);
    for (let i = 0; i < 19; i++) {
      context.act(() =>
        formMetadataEditor.findByProps({ id: "title" }).props.onChange({ target: { value: `Meat ${i}` } })
      );
    }
    await waitForExpect(() => expect(formMetadataEditor.props.form.title).toEqual("Meat"));
    const formBuilder = context.testRenderer.root.findByType(NavFormBuilder);
    expect(formBuilder.instance.builder.form).toMatchObject({ title: "Meat" });
    expect(formBuilder.instance.builder.form).not.toEqual(context.backend.form());
    await waitForExpect(() => expect(formBuilder.instance.builderState).toEqual("ready"));
  });
});

import { AppConfigProvider, LanguagesProvider, NavFormioJs } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import createMockImplementation, { DEFAULT_PROJECT_URL } from "../../test/backendMockImplementation";
import featureToggles from "../../test/featureToggles";
import AuthenticatedApp from "../AuthenticatedApp";
import { AuthContext } from "../context/auth-context";
import FeedbackProvider from "../context/notifications/FeedbackContext";

describe("FormsRouter", () => {
  let formioFetch;

  beforeAll(() => {
    formioFetch = vi.spyOn(NavFormioJs.Formio, "fetch");
    formioFetch.mockImplementation(createMockImplementation());
    fetchMock.mockImplementation(createMockImplementation());
  });

  afterEach(() => {
    formioFetch.mockClear();
    fetchMock.mockClear();
  });

  function renderApp(pathname) {
    return render(
      <MemoryRouter initialEntries={[pathname]}>
        <AuthContext.Provider
          value={{
            userData: "fakeUser",
            login: () => {},
          }}
        >
          <FeedbackProvider>
            <AppConfigProvider featureToggles={featureToggles} baseUrl={DEFAULT_PROJECT_URL}>
              <LanguagesProvider translations={{}}>
                <AuthenticatedApp
                  formio={new NavFormioJs.Formio(DEFAULT_PROJECT_URL)}
                  serverURL={DEFAULT_PROJECT_URL}
                />
              </LanguagesProvider>
            </AppConfigProvider>
          </FeedbackProvider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
  }

  it("lets you navigate to new form page from the list of all forms", async () => {
    renderApp("/forms");
    const knapp = await screen.findByRole("button", { name: "Lag nytt skjema" });
    await userEvent.click(knapp);
    expect(await screen.findByRole("button", { name: "Opprett" })).toBeInTheDocument();
  });

  it("can edit a form", async () => {
    renderApp("/forms/debugskjema/edit");
    expect(await screen.findByRole("heading", { name: "debug skjema" })).toBeInTheDocument();
    expect(await screen.findByLabelText("Text Area", { exact: false })).toBeInTheDocument();
  });

  it("navigates from the list to the editor", async () => {
    renderApp("/forms");
    const link = await screen.findByRole("link", { name: "debug skjema" });
    await userEvent.click(link);
    expect(await screen.findByRole("heading", { name: "debug skjema" }));
    expect(await screen.findByLabelText("Text Area", { exact: false })).toBeInTheDocument();
  });

  it("displays all the forms with an edit link", async () => {
    renderApp("/forms");
    const editLinks = await screen.findAllByTestId("editLink");
    expect(editLinks).toHaveLength(2);
    editLinks.forEach((link) =>
      expect(link.href).toMatch(/http:\/\/localhost(:\d+)?\/forms\/(columns|debugskjema)\/edit/),
    );
  });
});

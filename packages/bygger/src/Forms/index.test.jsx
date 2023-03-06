import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formio } from "formiojs";
import fetchMock from "jest-fetch-mock";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import createMockImplementation from "../../test/backendMockImplementation";
import featureToggles from "../../test/featureToggles";
import AuthenticatedApp from "../AuthenticatedApp";
import { AuthContext } from "../context/auth-context";
import FeedbackProvider from "../context/notifications/feedbackContext";

describe("FormsRouter", () => {
  beforeEach(() => {
    fetchMock.mockImplementation(createMockImplementation());
  });

  afterEach(() => {
    fetchMock.resetMocks();
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
            <AppConfigProvider featureToggles={featureToggles} baseUrl="http://baseurl.example.org">
              <AuthenticatedApp
                formio={new Formio("http://myproject.example.org")}
                serverURL={"http://myproject.example.org"}
              />
            </AppConfigProvider>
          </FeedbackProvider>
        </AuthContext.Provider>
      </MemoryRouter>
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
    expect(await screen.findByLabelText("Text Area")).toBeInTheDocument();
  });

  it("navigates from the list to the editor", async () => {
    renderApp("/forms");
    const link = await screen.findByRole("link", { name: "debug skjema" });
    await userEvent.click(link);
    expect(await screen.findByRole("heading", { name: "debug skjema" }));
    expect(await screen.findByLabelText("Text Area")).toBeInTheDocument();
  });

  it("displays all the forms with an edit link", async () => {
    renderApp("/forms");
    const editLinks = await screen.findAllByTestId("editLink");
    expect(editLinks).toHaveLength(2);
    editLinks.forEach((link) => expect(link.href).toMatch(/http:\/\/localhost\/forms\/(columns|debugskjema)\/edit/));
  });
});

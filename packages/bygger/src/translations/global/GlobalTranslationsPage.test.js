import React from "react";
import { render, screen } from "@testing-library/react";
import GlobalTranslationsPage from "./GlobalTranslationsPage";
import { MemoryRouter } from "react-router-dom";
import { UserAlerterContext } from "../../userAlerting";
import I18nProvider from "../../context/i18n";
import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";

const globalEnglishTranslation = {
  en: [
    {
      id: "123",
      tag: "skjematekster",
      translations: { "Bor du i Norge?": { value: "Do you live in Norway?", scope: "global" } },
    },
    {
      id: "345",
      tag: "validering",
      translations: {
        "Du må fylle ut:{{field}}": { value: "You have to fill out: {{field}}", scope: "global" },
      },
    },
    { id: "456", tag: "grensesnitt", translations: { Ja: { value: "Yes", scope: "global" } } },
  ],
};

describe("GlobalTranslationsPage", () => {
  const renderGlobalTranslationsPage = (loadTranslation, languageCode = "") => {
    const mockedDeleteTranslation = jest.fn();
    const mockedSaveTranslations = jest.fn();
    const userAlerter = {
      flashSuccessMessage: jest.fn(),
      alertComponent: jest.fn(),
    };
    render(
      <AppConfigProvider featureToggles={{ enableTranslations: true }}>
        <MemoryRouter initialEntries={[`/translations/global/${languageCode}/skjematekster`]}>
          <UserAlerterContext.Provider value={userAlerter}>
            <I18nProvider loadTranslations={loadTranslation} forGlobal>
              <GlobalTranslationsPage
                loadGlobalTranslations={loadTranslation}
                projectURL={""}
                deleteTranslation={mockedDeleteTranslation}
                saveTranslation={mockedSaveTranslations}
                languageCode={languageCode}
              />
            </I18nProvider>
          </UserAlerterContext.Provider>
        </MemoryRouter>
      </AppConfigProvider>
    );

    afterEach(() => {
      mockedDeleteTranslation.mockClear();
      mockedSaveTranslations.mockClear();
    });
  };

  describe("Render global translation page without available languages", () => {
    beforeEach(() => {
      renderGlobalTranslationsPage(
        jest.fn(() => Promise.resolve({})),
        ""
      );
    });

    it("renders empty header and languageSelector with velg språk label", async () => {
      const languageSelectorLabel = await screen.getByRole("button", { name: "Velg språk" });
      const addNewTranslationButton = await screen.getByRole("button", { name: "Legg til ny tekst" });
      const languageHeading = await screen.getByRole("heading", { level: 1, name: "" });
      expect(languageSelectorLabel).toBeDefined();
      expect(addNewTranslationButton).toBeDefined();
      expect(languageHeading).toBeDefined();
    });
  });

  describe("Render global translation page with English translations", () => {
    const mockedLoadTranslation = jest.fn(() => Promise.resolve(globalEnglishTranslation));
    beforeEach(() => {
      renderGlobalTranslationsPage(mockedLoadTranslation, "en");
    });
    it("renders header with English label", async () => {
      const addNewTranslationButton = screen.getByRole("button", { name: "Legg til ny tekst" });
      const languageHeading = screen.getByRole("heading", { level: 1, name: "Engelsk" });
      const originalTextField = await screen.findByDisplayValue("Bor du i Norge?");
      const translationField = screen.getByDisplayValue("Do you live in Norway?");

      expect(addNewTranslationButton).toBeDefined();
      expect(languageHeading).toBeInTheDocument();
      expect(originalTextField).toBeInTheDocument();
      expect(translationField).toBeInTheDocument();
    });

    afterEach(() => {
      mockedLoadTranslation.mockClear();
    });
  });
});

import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import I18nStateProvider from "../../context/i18n";
import { UserAlerterContext } from "../../userAlerting";
import GlobalTranslationsPage from "./GlobalTranslationsPage";

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
  let mockedDeleteTranslation;
  let mockedSaveTranslations;

  const renderGlobalTranslationsPage = async (loadTranslation, languageCode = "") => {
    mockedDeleteTranslation = jest.fn();
    mockedSaveTranslations = jest.fn();
    const userAlerter = {
      flashSuccessMessage: jest.fn(),
      alertComponent: jest.fn(),
    };
    await act(async () => {
      render(
        <AppConfigProvider featureToggles={{ enableTranslations: true }}>
          <MemoryRouter initialEntries={[`/translations/global/${languageCode}/skjematekster`]}>
            <UserAlerterContext.Provider value={userAlerter}>
              <I18nStateProvider loadTranslations={loadTranslation}>
                <GlobalTranslationsPage
                  loadGlobalTranslations={loadTranslation}
                  projectURL={""}
                  deleteTranslation={mockedDeleteTranslation}
                  saveTranslation={mockedSaveTranslations}
                  languageCode={languageCode}
                />
              </I18nStateProvider>
            </UserAlerterContext.Provider>
          </MemoryRouter>
        </AppConfigProvider>
      );
    });
  };

  afterEach(() => {
    mockedDeleteTranslation.mockClear();
    mockedSaveTranslations.mockClear();
  });

  describe("Render global translation page without available languages", () => {
    beforeEach(async () => {
      await renderGlobalTranslationsPage(
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
    let mockedLoadTranslation;
    beforeEach(() => {
      mockedLoadTranslation = jest.fn(() => Promise.resolve(globalEnglishTranslation));
      renderGlobalTranslationsPage(mockedLoadTranslation, "en");
    });
    afterEach(() => {
      mockedLoadTranslation.mockClear();
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
  });
});

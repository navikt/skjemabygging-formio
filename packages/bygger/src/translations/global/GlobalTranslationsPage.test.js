import React from "react";
import { render, screen } from "@testing-library/react";
import GlobalTranslationsPage from "./GlobalTranslationsPage";
import { MemoryRouter } from "react-router-dom";
import { UserAlerterContext } from "../../userAlerting";
import I18nProvider from "../../context/i18n";
import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import userEvent from "@testing-library/user-event";

describe("GlobalTranslationsPage", () => {
  describe("Render global translation page without available languages", () => {
    const mockedLoadGlobalTranslations = jest.fn(() => Promise.resolve({}));
    const mockedDeleteTranslation = jest.fn();
    const mockedSaveTranslations = jest.fn();
    const userAlerter = {
      flashSuccessMessage: jest.fn(),
      alertComponent: jest.fn(),
    };
    beforeEach(() => {
      render(
        <AppConfigProvider featureToggles={{ enableTranslations: true }}>
          <MemoryRouter>
            <UserAlerterContext.Provider value={userAlerter}>
              <I18nProvider loadTranslations={mockedLoadGlobalTranslations}>
                <GlobalTranslationsPage
                  loadGlobalTranslations={mockedLoadGlobalTranslations}
                  projectURL={""}
                  deleteTranslation={mockedDeleteTranslation}
                  saveTranslation={mockedSaveTranslations}
                  languageCode={""}
                />
              </I18nProvider>
            </UserAlerterContext.Provider>
          </MemoryRouter>
        </AppConfigProvider>
      );
    });

    afterEach(() => {
      mockedLoadGlobalTranslations.mockClear();
      mockedDeleteTranslation.mockClear();
      mockedSaveTranslations.mockClear();
    });

    it("renders empty header and languageSelector with velg språk label", async () => {
      const languageSelectorLabel = await screen.getByRole("button", { name: "Velg språk" });
      const addNewTranslationButton = await screen.getByRole("button", { name: "Legg til ny tekst" });
      const languageHeading = await screen.getByRole("heading", { level: 1, name: "" });
      expect(languageSelectorLabel).toBeDefined();
      expect(addNewTranslationButton).toBeDefined();
      expect(languageHeading).toBeDefined();
    });
    /*    it("renders legg til ny tekst button only in skjematekst panel", () => {
      userEvent.click(screen.getByRole("button", { name: "Grensesnitt" }));
      const addNewTranslationButton = screen.getByRole("button", { name: "Legg til ny tekst" });
      expect(addNewTranslationButton).toBeUndefined();
    });*/
  });
});

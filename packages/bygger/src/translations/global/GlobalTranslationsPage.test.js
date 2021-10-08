import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import GlobalTranslationsPage from "./GlobalTranslationsPage";
import { MemoryRouter } from "react-router-dom";
import { UserAlerterContext } from "../../userAlerting";
import I18nProvider from "../../context/i18n";
import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";

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
            <I18nProvider loadTranslations={loadTranslation}>
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

  /*describe("Render global translation page without available languages", () => {
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

    it("renders global translation page when deleting an empty language", () => {
      const deleteLanguage = screen.getByRole("button", { name: "Slett språk" });
      fireEvent.click(deleteLanguage);
      expect(deleteLanguage).toBeDefined();
    });

    /!*    it("renders same page when saving an empty language and empty translation", async () => {
      const saveLanguage = screen.getByRole("button", { name: "Lagre" });
      await fireEvent.click(saveLanguage);
      const alertComponent = screen.queryAllByRole("aside");
      console.log(alertComponent);
      expect(alertComponent).toBeNull();
    });*!/
    /!*    it("renders legg til ny tekst button only in skjematekst panel", async () => {
      const toggleButton = screen.getByRole("button", { name: "Validering" });
      await fireEvent.click(toggleButton);
      //screen.getByRole("button", { name: "Grensesnitt" }).;
      //const addNewTranslationButton = screen.getByRole("button", { name: "Legg til ny tekst" });
      expect(toggleButton).toBeCalled();
      expect(addNewTranslationButton).toBeNull();
    });*!/
  });
*/
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

  describe("Render global translation page with English translations", () => {
    const mockedLoadTranslation = jest.fn(() => Promise.resolve(globalEnglishTranslation));
    beforeEach(() => {
      renderGlobalTranslationsPage(mockedLoadTranslation, "en");
    });
    it("renders header and languageSelector with Engelsk label", async () => {
      const languageSelectorLabel = screen.getByRole("button", { name: "Engelsk" });
      //const addNewTranslationButton = screen.getByRole("button", { name: "Legg til ny tekst" });
      //const languageHeading = await screen.getByRole("heading", { level: 1, name: "Engelsk" });
      //expect(mockedLoadTranslation.mock.results[1].value).toBe({});
      expect(languageSelectorLabel).toBeDefined();
      //expect(addNewTranslationButton).toBeDefined();
      //expect(languageHeading).toBeInTheDocument();
    });

    afterEach(() => {
      mockedLoadTranslation.mockClear();
    });
  });
});

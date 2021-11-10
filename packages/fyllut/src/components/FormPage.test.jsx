import React from "react";
import {MemoryRouter} from "react-router-dom";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AppConfigProvider} from "@navikt/skjemadigitalisering-shared-components";
import FormPage from "./FormPage";

jest.mock("@navikt/skjemadigitalisering-shared-components", () => ({
  ...jest.requireActual("@navikt/skjemadigitalisering-shared-components"),
  AmplitudeProvider: ({children}) => <>{children}</>,
}));

const form = {
  title: "Testskjema",
  path: "testskjema"
}

const translations = {
  "en": {
    "Testskjema": "Test form"
  }
}

describe("FormPage", () => {

  const renderFormPage = (form, featureToggles = {enableTranslations: true}) => {
    render(
      <MemoryRouter>
        <AppConfigProvider featureToggles={featureToggles}>
          <FormPage form={form} />
        </AppConfigProvider>
      </MemoryRouter>
    );
  }

  describe("FeatureToggle enableTranslations=false", () => {

    it("renders form when translations are not enabled", async () => {
      fetchMock.mockImplementation((url, options) => {
        return Promise.reject(new Error(`Ingen kall til backend forventes: ${url}`));
      });

      renderFormPage(form, {enableTranslations: false});

      expect(await screen.findByRole("heading", {name: "Testskjema"})).toBeInTheDocument();
      expect(await screen.queryByRole("button", {name: "Norsk bokmål"})).not.toBeInTheDocument();
    });

  });

  describe("Language selector", () => {

    it("is not rendered if no translations are available", async () => {

      fetchMock.mockImplementation((url, options) => {
        if (url === "/fyllut/translations/testskjema") {
          return Promise.resolve(new Response(JSON.stringify({})));
        }
        if (url.startsWith("/fyllut/countries")) {
          return Promise.resolve(new Response(JSON.stringify([])));
        }
        if (url.startsWith("/fyllut/global-translations/")) {
          return Promise.resolve(new Response(JSON.stringify({})));
        }
        return Promise.reject(new Error(`Ukjent url: ${url}`));
      });

      renderFormPage(form);

      expect(await screen.findByRole("heading", {name: "Testskjema"})).toBeInTheDocument();
      expect(await screen.queryByRole("button", {name: "Norsk bokmål"})).not.toBeInTheDocument();
    });

    it("allows selection of other language for the form", async () => {

      fetchMock.mockImplementation((url, options) => {
        if (url === "/fyllut/translations/testskjema") {
          return Promise.resolve(new Response(JSON.stringify(translations)));
        }
        if (url.startsWith("/fyllut/countries")) {
          return Promise.resolve(new Response(JSON.stringify([])));
        }
        if (url.startsWith("/fyllut/global-translations/")) {
          return Promise.resolve(new Response(JSON.stringify({})));
        }
        return Promise.reject(new Error(`Ukjent url: ${url}`));
      });

      renderFormPage(form);

      expect(await screen.findByRole("heading", {name: "Testskjema"})).toBeInTheDocument();
      const languageSelector = screen.queryByRole("button", {name: "Norsk bokmål"});
      expect(languageSelector).toBeInTheDocument();
      userEvent.click(languageSelector);
      userEvent.click(await screen.findByRole("link", {name: "English"}));
      expect(await screen.findByRole("heading", {name: "Test form"})).toBeInTheDocument();
    });

  });

});

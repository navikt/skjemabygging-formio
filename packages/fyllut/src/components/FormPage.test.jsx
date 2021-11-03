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

  it("selects other language for form", async () => {

    fetchMock.mockImplementation((url, options) => {
      if (url === "/fyllut/translations/testskjema") {
        return Promise.resolve(new Response(JSON.stringify(translations)));
      }
      if (url.startsWith("/fyllut/countries")) {
        return Promise.resolve(new Response(JSON.stringify([])));
      }
      return Promise.reject(new Error(`Ukjent url: ${url}`));
    });

    render(
      <MemoryRouter>
        <AppConfigProvider featureToggles={{enableTranslations: true}}>
          <FormPage form={form} />
        </AppConfigProvider>
      </MemoryRouter>
    );
    expect(await screen.findByRole("heading", {name: "Testskjema"})).toBeInTheDocument();
    const languageSelector = await screen.findByRole("button", {name: "Norsk bokmål"});
    expect(languageSelector).toBeInTheDocument();
    userEvent.click(languageSelector);
    userEvent.click(await screen.findByRole("link", {name: "English"}));
    expect(await screen.findByRole("heading", {name: "Test form"})).toBeInTheDocument();
  });

});

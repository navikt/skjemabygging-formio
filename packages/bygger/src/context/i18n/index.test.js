import React from "react";
import { render, screen } from "@testing-library/react";
import I18nProvider, {useTranslations} from "./index";

const TestComponent = ({setInjectedTranslations}) => {
  const { translationsForNavForm } = useTranslations();
  setInjectedTranslations(translationsForNavForm);
  return (
    <div>Loaded translations for {Object.keys(translationsForNavForm).length} languages</div>
  )
};

const translations = {
  "nn-NO": {
    "id": "61828d1945f11b000346b3f6", "translations": {
      "Testskjema": {"value": "Testskjema", "scope": "local"},
      "Fornavn": {"value": "Førenamn", "scope": "local"},
    }
  },
  "en": {
    "id": "6165717c00e3bc0003c9da66", "translations": {
      "Testskjema": {"value": "Test form", "scope": "local"},
      "Fornavn": {"value": "First name", "scope": "local"},
    }
  }
};

const form = {
  title: "Testskjema",
  components: [
    {
      label: "Fornavn",
      type: "textfield",
      key: "textfield",
      inputType: "text",
      input: true
    }
  ]
};

describe("I18nProvider", () => {

  it("should inject nb-NO default texts in translations along with actual translations", async () => {
    const setInjectedTranslations = jest.fn();
    const loadTranslations = () => Promise.resolve(translations);
    render(
      <I18nProvider loadTranslations={loadTranslations} form={form}>
        <TestComponent setInjectedTranslations={setInjectedTranslations} />
      </I18nProvider>
    )
    expect(await screen.findByText("Loaded translations for 3 languages")).toBeInTheDocument();
    expect(setInjectedTranslations).toHaveBeenCalled();
    const injectedTranslations = setInjectedTranslations.mock.calls[setInjectedTranslations.mock.calls.length - 1][0];
    expect(injectedTranslations["nb-NO"].Testskjema).toEqual("Testskjema");
    expect(injectedTranslations["nb-NO"].Fornavn).toEqual("Fornavn");
    expect(injectedTranslations["en"].Testskjema).toEqual(translations.en.translations.Testskjema.value);
    expect(injectedTranslations["en"].Fornavn).toEqual(translations.en.translations.Fornavn.value);
    expect(injectedTranslations["nn-NO"].Testskjema).toEqual(translations["nn-NO"].translations.Testskjema.value);
    expect(injectedTranslations["nn-NO"].Fornavn).toEqual(translations["nn-NO"].translations.Fornavn.value);
  });

});

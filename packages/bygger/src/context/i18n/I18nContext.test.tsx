import { FormioTranslation, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen } from "@testing-library/react";
import I18nStateProvider, { useI18nState } from "./I18nContext";

const mockedTranslations: { [index: string]: FormioTranslation } = {
  "nn-NO": {
    id: "61828d1945f11b000346b3f6",
    translations: {
      Testskjema: { value: "Testskjema", scope: "local" },
      Fornavn: { value: "Førenamn", scope: "local" },
    },
  },
  en: {
    id: "6165717c00e3bc0003c9da66",
    translations: {
      Testskjema: { value: "Test form", scope: "local" },
      Fornavn: { value: "First name", scope: "local" },
      "Global oversettelse": { value: "Global oversettelse", scope: "global" },
      Norge: { value: "Norway", scope: "component-countryName" },
    },
  },
};

const form = {
  title: "Testskjema",
  components: [
    {
      label: "Fornavn",
      type: "textfield",
      key: "textfield",
      inputType: "text",
      input: true,
    },
  ],
} as unknown as NavFormType;

describe("I18nStateProvider", () => {
  const loadTranslations = () => Promise.resolve(mockedTranslations);

  const TestStateComponent = ({ onStateUpdated }) => {
    const state = useI18nState();
    onStateUpdated(state);
    return <div>Loaded translations for {Object.keys(state.translationsForNavForm).length} languages</div>;
  };

  const onStateUpdated = jest.fn();

  beforeEach(async () => {
    render(
      <I18nStateProvider loadTranslations={loadTranslations} form={form}>
        <TestStateComponent onStateUpdated={onStateUpdated} />
      </I18nStateProvider>
    );
    expect(await screen.findByText("Loaded translations for 3 languages")).toBeInTheDocument();
  });

  it("populates state with translations", () => {
    const { translations } = onStateUpdated.mock.calls[onStateUpdated.mock.calls.length - 1][0];
    expect(onStateUpdated).toHaveBeenCalled();
    expect(translations).toEqual(mockedTranslations);
  });

  it("adds translations to translationsForNavForm in i18n format", () => {
    const { translationsForNavForm } = onStateUpdated.mock.calls[onStateUpdated.mock.calls.length - 1][0];
    expect(translationsForNavForm["en"].Testskjema).toEqual(mockedTranslations["en"].translations.Testskjema.value);
    expect(translationsForNavForm["en"].Fornavn).toEqual(mockedTranslations["en"].translations.Fornavn.value);
    expect(translationsForNavForm["en"]["Global oversettelse"]).toEqual(
      mockedTranslations["en"].translations["Global oversettelse"].value
    );
    expect(translationsForNavForm["en"].Norge).toEqual(mockedTranslations["en"].translations.Norge.value);
    expect(translationsForNavForm["nn-NO"].Testskjema).toEqual(
      mockedTranslations["nn-NO"].translations.Testskjema.value
    );
    expect(translationsForNavForm["nn-NO"].Fornavn).toEqual(mockedTranslations["nn-NO"].translations.Fornavn.value);
  });

  it("injects nb-NO default texts in translationsForNavForm", async () => {
    const { translationsForNavForm } = onStateUpdated.mock.calls[onStateUpdated.mock.calls.length - 1][0];
    expect(translationsForNavForm["nb-NO"].Testskjema).toEqual("Testskjema");
    expect(translationsForNavForm["nb-NO"].Fornavn).toEqual("Fornavn");
  });

  it("adds translations to localTranslationsForNavForm in i18n format", () => {
    const { localTranslationsForNavForm } = onStateUpdated.mock.calls[onStateUpdated.mock.calls.length - 1][0];
    expect(localTranslationsForNavForm["en"].Testskjema).toEqual(
      mockedTranslations["en"].translations.Testskjema.value
    );
    expect(localTranslationsForNavForm["en"].Fornavn).toEqual(mockedTranslations["en"].translations.Fornavn.value);
    expect(localTranslationsForNavForm["nn-NO"].Testskjema).toEqual(
      mockedTranslations["nn-NO"].translations.Testskjema.value
    );
    expect(localTranslationsForNavForm["nn-NO"].Fornavn).toEqual(
      mockedTranslations["nn-NO"].translations.Fornavn.value
    );
  });

  it("filters out country names and global translations in localTranslationsForNavForm", () => {
    const { localTranslationsForNavForm } = onStateUpdated.mock.calls[onStateUpdated.mock.calls.length - 1][0];
    expect(localTranslationsForNavForm["en"]["Global oversettelse"]).toBeUndefined();
    expect(localTranslationsForNavForm["en"].Norge).toBeUndefined();
  });
});

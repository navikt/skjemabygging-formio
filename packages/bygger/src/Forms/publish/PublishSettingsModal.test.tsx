import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { MockedComponentObjectForTest } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PublishSettingsModal, { getCompleteTranslationLanguageCodeList } from "./PublishSettingsModal";

const { createDummyRadioPanel, createFormObject, createPanelObject, createFormPropertiesObject } =
  MockedComponentObjectForTest;

vi.mock("../../context/i18n/index", () => {
  const languagesInNorwegian = {
    "nn-NO": "Norsk nynorsk",
    en: "Engelsk",
    pl: "Polsk",
  };

  const mockTranslationsForNavForm = {
    en: {
      "Bor du i Norge?": "Do you live in Norway?",
      Veiledning: "Guidance",
      "NO-label": "no",
      "YES-label": "yes",
      "Dine opplysninger": "Your information",
      Personinformasjon: "Personal information",
      "Hei verden": "Hello world",
      "Hei panel": "Hello panel",
    },
    "nn-NO": { "YES-label": "yes", "Hei verden": "Hei verda", "Hei panel": "Hei panel" },
  };
  const mockUseI18nState = () => ({
    translationsForNavForm: mockTranslationsForNavForm,
  });
  return {
    useI18nState: mockUseI18nState,
    languagesInNorwegian,
  };
});

Modal.setAppElement(document.createElement("div"));

describe("PublishSettingsModal", () => {
  let mockedCloseModal;
  let mockedOnPublish;
  const renderPublishSettingsModal = (form) => {
    mockedCloseModal = vi.fn();
    mockedOnPublish = vi.fn();
    render(
      <PublishSettingsModal openModal={true} closeModal={mockedCloseModal} onPublish={mockedOnPublish} form={form} />
    );
  };

  it("renders disabled checkbox for Norsk bokmål", () => {
    const form = createFormObject([createPanelObject("test", [createDummyRadioPanel("Bor du i Sverige?")])]);
    renderPublishSettingsModal(form);
    expect(screen.queryByRole("checkbox", { name: "Norsk bokmål (NB-NO)" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Norsk bokmål (NB-NO)" })).toBeChecked();
    expect(screen.queryByRole("checkbox", { name: "Norsk bokmål (NB-NO)" })).toBeDisabled();
  });

  it("renders checked checkbox for language with complete translation", async () => {
    const form = createFormObject(
      [createPanelObject("Dine opplysninger", [createDummyRadioPanel("Bor du i Norge?")])],
      "Veiledning"
    );
    renderPublishSettingsModal(form);
    expect(screen.queryByRole("checkbox", { name: "Engelsk (EN)" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Engelsk (EN)" })).toBeChecked();
    expect(screen.queryByRole("checkbox", { name: "Norsk nynorsk (NN-NO)" })).not.toBeInTheDocument();
  });

  it("renders disabled checkbox for previously published language when current translation is incomplete", async () => {
    const form = createFormObject(
      [createPanelObject("Dine opplysninger", [createDummyRadioPanel("Bor du i Norge?")])],
      "Veiledning",
      createFormPropertiesObject({ publishedLanguages: ["nn-NO"] })
    );
    renderPublishSettingsModal(form);
    expect(screen.queryByRole("checkbox", { name: "Norsk nynorsk (NN-NO)" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Norsk nynorsk (NN-NO)" })).toBeDisabled();
    expect(screen.queryByRole("checkbox", { name: "Norsk nynorsk (NN-NO)" })).not.toBeChecked();
  });

  it("displays a warning when checkbox for previously published translation is unchecked", async () => {
    const form = createFormObject(
      [createPanelObject("Dine opplysninger", [createDummyRadioPanel("Bor du i Norge?")])],
      "Veiledning",
      createFormPropertiesObject({ publishedLanguages: ["en"] })
    );
    renderPublishSettingsModal(form);
    expect(
      screen.queryByText("OBS! Engelsk (EN) vil bli avpublisert hvis du publiserer med disse innstillingene.")
    ).not.toBeInTheDocument();
    userEvent.click(await screen.findByRole("checkbox", { name: "Engelsk (EN)" }));
    expect(
      screen.queryByText("OBS! Engelsk (EN) vil bli avpublisert hvis du publiserer med disse innstillingene.")
    ).toBeInTheDocument();
  });

  it("displays a warning when previously published translation currently is incomplete", () => {
    const form = createFormObject(
      [createPanelObject("Dine opplysninger", [createDummyRadioPanel("Bor du i Norge?")])],
      "Veiledning",
      createFormPropertiesObject({ publishedLanguages: ["nn-NO"] })
    );
    renderPublishSettingsModal(form);
    expect(
      screen.queryByText("OBS! Norsk nynorsk (NN-NO) vil bli avpublisert hvis du publiserer med disse innstillingene.")
    ).toBeInTheDocument();
  });

  it("publish will send en-languageCode if the English checkbox is checked ", async () => {
    const form = createFormObject(
      [createPanelObject("Personinformasjon", [createDummyRadioPanel("Bor du i Norge?")])],
      "Veiledning"
    );
    renderPublishSettingsModal(form);
    const englishCheckbox = await screen.findByRole("checkbox", { name: "Engelsk (EN)" });
    expect(englishCheckbox).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: "Norsk nynorsk (NN-NO)" })).not.toBeInTheDocument();
    userEvent.click(screen.getByRole("button", { name: "Publiser" }));
    expect(mockedOnPublish).toBeCalled();
    expect(mockedOnPublish.mock.calls[0][0]).toEqual(["en"]);
  });

  it("publishes all checked languages", () => {
    const form = createFormObject([createPanelObject("Hei panel")], "Hei verden");
    renderPublishSettingsModal(form);
    expect(screen.queryByRole("checkbox", { name: "Norsk nynorsk (NN-NO)" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Norsk nynorsk (NN-NO)" })).toBeChecked();
    expect(screen.queryByRole("checkbox", { name: "Engelsk (EN)" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Engelsk (EN)" })).toBeChecked();
    userEvent.click(screen.getByRole("button", { name: "Publiser" }));
    expect(mockedOnPublish).toBeCalled();
    expect(mockedOnPublish.mock.calls[0][0]).toEqual(["en", "nn-NO"]);
  });

  it("onPublish will send empty array when the English checkbox is checked off", async () => {
    const form = createFormObject(
      [createPanelObject("Personinformasjon", [createDummyRadioPanel("Bor du i Norge?")])],
      "Veiledning"
    );
    renderPublishSettingsModal(form);
    const englishCheckbox = await screen.findByRole("checkbox", { name: "Engelsk (EN)" });
    expect(englishCheckbox).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: "Norsk nynorsk (NN-NO)" })).not.toBeInTheDocument();
    userEvent.click(await screen.findByRole("checkbox", { name: "Engelsk (EN)" }));
    userEvent.click(screen.getByRole("button", { name: "Publiser" }));
    expect(mockedOnPublish).toBeCalled();
    expect(mockedOnPublish.mock.calls[0][0]).toEqual([]);
  });
});

describe("getCompleteTranslationLanguageCodeList", () => {
  it("return empty list when there is no form text and translation", () => {
    const actual = getCompleteTranslationLanguageCodeList([], {});
    expect(actual).toEqual([]);
  });

  it("return empty list when there are form text and but no translation", () => {
    const actual = getCompleteTranslationLanguageCodeList(["Bor du i Norge", "Ja", "Nei"], {});
    expect(actual).toEqual([]);
  });
  it("return empty list when there are form text and not complete translations", () => {
    const actual = getCompleteTranslationLanguageCodeList(["Bor du i Norge?", "Ja", "Nei"], {
      en: { "Bor du i Norge?": "Do you live in Norway?" },
      "nn-NO": { Ja: "Yes" },
    });
    expect(actual).toEqual([]);
  });
  it("return en when there are form text and complete English translations", () => {
    const actual = getCompleteTranslationLanguageCodeList(["Bor du i Norge?", "Ja", "Nei"], {
      en: { "Bor du i Norge?": "Do you live in Norway?", Ja: "Yes", Nei: "No" },
      "nn-NO": { Ja: "Ja" },
    });
    expect(actual).toEqual(["en"]);
  });

  it("return en and nn-NO when there are form text and complete English and Nynorsk translations", () => {
    const actual = getCompleteTranslationLanguageCodeList(["Bor du i Norge?", "Ja", "Nei"], {
      en: { "Bor du i Norge?": "Do you live in Norway?", Ja: "Yes", Nei: "No" },
      "nn-NO": { "Bor du i Norge?": "Bor du i Norge?", Ja: "Ja", Nei: "Nei", Takk: "Takk" },
    });
    expect(actual).toEqual(["en", "nn-NO"]);
  });

  it("does not include nb-NO even if complete", () => {
    const actual = getCompleteTranslationLanguageCodeList(["Bor du i Norge?", "Ja", "Nei"], {
      en: { "Bor du i Norge?": "Do you live in Norway?", Ja: "Yes", Nei: "No" },
      "nn-NO": { "Bor du i Norge?": "Bur du i Noreg?", Ja: "Ja", Nei: "Nei", Takk: "Takk" },
      "nb-NO": { "Bor du i Norge?": "Bor du i Norge?", Ja: "Ja", Nei: "Nei", Takk: "Takk" },
    });
    expect(actual).toEqual(["en", "nn-NO"]);
  });
});

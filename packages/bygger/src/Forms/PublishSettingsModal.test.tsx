import { MockedComponentObjectForTest } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import PublishSettingsModal, { getCompleteTranslationLanguageCodeList } from "./PublishSettingsModal";

const { createDummyRadioPanel, createFormObject, createPanelObject } = MockedComponentObjectForTest;

jest.mock("../context/i18n/index", () => {
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
    },
    "nn-NO": { "YES-label": "yes" },
  };
  const mockUseTranslation = () => ({
    translationsForNavForm: mockTranslationsForNavForm,
  });
  return {
    useTranslations: mockUseTranslation,
    languagesInNorwegian,
  };
});

describe("PublishSettingsModal", () => {
  let mockedCloseModal;
  let mockedPublishModal;
  const renderPublishSettingsModal = (form) => {
    mockedCloseModal = jest.fn();
    mockedPublishModal = jest.fn();
    render(
      <PublishSettingsModal
        openModal={true}
        closeModal={mockedCloseModal}
        publishModal={mockedPublishModal}
        form={form}
      />
    );
  };

  it("not render checkbox when there is no complete translation", () => {
    const form = createFormObject([createPanelObject("test", [createDummyRadioPanel("Bor du i Sverige?")])]);
    renderPublishSettingsModal(form);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("render only checkbox with English label when only complete English translation is available", async () => {
    const form = createFormObject(
      [createPanelObject("Dine opplysninger", [createDummyRadioPanel("Bor du i Norge?")])],
      "Veiledning"
    );
    renderPublishSettingsModal(form);
    expect(await screen.findByRole("checkbox", { name: "Engelsk (EN)" })).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: "Norsk nynorsk (NN-NO)" })).not.toBeInTheDocument();
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
    userEvent.click(englishCheckbox);
    userEvent.click(screen.getByRole("button", { name: "Publiser" }));
    expect(mockedPublishModal).toBeCalled();
    expect(mockedPublishModal.mock.calls[0][0]).toEqual(["en"]);
  });

  it("publish will send empty array when the English checkbox is checked and checked off", async () => {
    const form = createFormObject(
      [createPanelObject("Personinformasjon", [createDummyRadioPanel("Bor du i Norge?")])],
      "Veiledning"
    );
    renderPublishSettingsModal(form);
    const englishCheckbox = await screen.findByRole("checkbox", { name: "Engelsk (EN)" });
    expect(englishCheckbox).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: "Norsk nynorsk (NN-NO)" })).not.toBeInTheDocument();
    userEvent.click(englishCheckbox);
    userEvent.click(englishCheckbox);
    userEvent.click(screen.getByRole("button", { name: "Publiser" }));
    expect(mockedPublishModal).toBeCalled();
    expect(mockedPublishModal.mock.calls[0][0]).toEqual([]);
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
});

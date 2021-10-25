import React from "react";
import TranslationTextInput from "../TranslationTextInput";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { flattenTextsForEditPanel, tags } from "./utils";

export const getTranslationByOriginalText = (originalText, translations) =>
  translations.find((translation) => translation.originalText === originalText);

const ApplicationTextTranslationEditPanel = ({ selectedTag, translations, languageCode, updateTranslation }) => {
  function getApplicationTexts(tag) {
    const { grensesnitt, statiske, validering, common } = TEXTS;
    switch (tag) {
      case tags.GRENSESNITT:
        return flattenTextsForEditPanel({ ...grensesnitt, ...common });
      case tags.STATISKE_TEKSTER:
        return flattenTextsForEditPanel(statiske);
      case tags.VALIDERING:
        return flattenTextsForEditPanel(validering);
      default:
        return [];
    }
  }
  return (
    <form>
      {getApplicationTexts(selectedTag).map(({ key, type, text }) => {
        const id = getTranslationByOriginalText(text, translations)?.id || "";
        const value = getTranslationByOriginalText(text, translations)?.translatedText || "";
        return (
          <TranslationTextInput
            text={text}
            value={value}
            type={type}
            key={`${key}-${languageCode}`}
            hasGlobalTranslation={false}
            showGlobalTranslation={false}
            onChange={(value) => updateTranslation(id, text, value)}
          />
        );
      })}
    </form>
  );
};

export default ApplicationTextTranslationEditPanel;

import React, { useEffect, useState } from "react";
import TranslationTextInput from "../TranslationTextInput";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { flattenTextsForEditPanel, tags } from "./utils";
import { Undertittel } from "nav-frontend-typografi";

export const getTranslationByOriginalText = (originalText, translations) =>
  translations.find((translation) => translation.originalText === originalText);

const TranslationEditPanelComponent = ({ components, languageCode, updateTranslation, translations, tag }) => {
  return components.map(({ key, type, text }) => {
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
        onChange={(value) => updateTranslation(id, text, value, tag ? key : undefined)}
      />
    );
  });
};

const ApplicationTextTranslationEditPanel = ({ selectedTag, translations, languageCode, updateTranslation }) => {
  const [showPdfStatiske, setShowPdfStatiske] = useState(false);
  const { grensesnitt, statiske, validering, common, pdfStatiske } = TEXTS;

  useEffect(() => {
    if (selectedTag === tags.STATISKE_TEKSTER) setShowPdfStatiske(true);
    else setShowPdfStatiske(false);
  }, [selectedTag]);

  function getApplicationTexts(tag) {
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
      <TranslationEditPanelComponent
        components={getApplicationTexts(selectedTag)}
        languageCode={languageCode}
        translations={translations}
        updateTranslation={updateTranslation}
        tag={selectedTag === tags.VALIDERING ? tags.VALIDERING : undefined}
      />
      {showPdfStatiske && (
        <Undertittel className={"margin-bottom-default"}>Tekster som brukes ved generering av PDF</Undertittel>
      )}
      {showPdfStatiske && (
        <TranslationEditPanelComponent
          components={flattenTextsForEditPanel(pdfStatiske)}
          languageCode={languageCode}
          translations={translations}
          updateTranslation={updateTranslation}
        />
      )}
    </form>
  );
};

export default ApplicationTextTranslationEditPanel;

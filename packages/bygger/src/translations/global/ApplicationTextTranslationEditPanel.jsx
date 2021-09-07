import React from "react";
import TranslationTextInput from "../TranslationTextInput";

const getTranslation = (originalText, translations) =>
  translations.find((translation) => translation.originalText === originalText);

const ApplicationTextTranslationEditPanel = ({ texts, translations, languageCode, updateTranslation }) => (
  <form>
    {texts.map(({ key, type, text }) => {
      const id = getTranslation(text, translations)?.id || "";
      const value = getTranslation(text, translations)?.translatedText || "";
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

export default ApplicationTextTranslationEditPanel;

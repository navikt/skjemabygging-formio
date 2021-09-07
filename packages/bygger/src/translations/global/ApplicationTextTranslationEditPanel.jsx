import React from "react";
import { Input, Textarea } from "nav-frontend-skjema";

const getTranslation = (originalText, translations) =>
  translations.find((translation) => translation.originalText === originalText);

const ApplicationTextTranslationEditPanel = ({ classes, texts, translations, languageCode, updateTranslation }) => (
  <form>
    {texts.map(({ key, type, text }) => {
      const id = getTranslation(text, translations)?.id || "";
      const value = getTranslation(text, translations)?.translatedText || "";
      return (
        <div key={`${key}-${languageCode}`} className={classes.list}>
          {type === "textarea" ? (
            <Textarea
              id={id}
              label={text}
              className="margin-bottom-default"
              value={value}
              onChange={(event) => {
                updateTranslation(id, text, event.target.value);
              }}
            />
          ) : (
            <Input
              id={id}
              label={text}
              className="margin-bottom-default"
              type={type}
              value={value}
              onChange={(event) => {
                updateTranslation(id, text, event.target.value);
              }}
            />
          )}
        </div>
      );
    })}
  </form>
);

export default ApplicationTextTranslationEditPanel;

import React from "react";
import { Input, Textarea } from "nav-frontend-skjema";
import { applicationTexts } from "@navikt/skjemadigitalisering-shared-domain";
import { getInputType } from "../utils";

const prepareTexts = (texts, parentKey = "") => {
  return Object.entries(texts).flatMap((entry) => {
    if (typeof entry[1] === "object") {
      return prepareTexts(entry[1], entry[0]);
    }

    const key = parentKey.length > 0 ? `${parentKey}.${entry[0]}` : entry[0];
    const text = entry[1];
    return { key, text, type: getInputType(text) };
  });
};

const getTranslation = (originalText, translations) =>
  translations.find((translation) => translation.originalText === originalText);

const EditGrensesnittTranslationsPanel = ({ classes, currentTranslation, languageCode, updateTranslation }) => (
  <form>
    {prepareTexts(applicationTexts.grensesnitt).map(({ key, type, text }) => {
      const id = getTranslation(text, currentTranslation)?.id || "";
      const value = getTranslation(text, currentTranslation)?.translatedText || "";
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

export default EditGrensesnittTranslationsPanel;

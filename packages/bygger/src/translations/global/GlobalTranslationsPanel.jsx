import { Undertittel } from "nav-frontend-typografi";
import GlobalTranslationRow from "./GlobalTranslationRow";
import React from "react";

const GlobalTranslationsPanel = ({
  classes,
  currentTranslation,
  languageCode,
  updateOriginalText,
  updateTranslation,
  deleteOneRow,
}) => {
  return (
    <form>
      <li className={classes.label}>
        <Undertittel>Original</Undertittel>
        <Undertittel>Oversettelse</Undertittel>
      </li>
      {currentTranslation.map(({ id, originalText, translatedText }) => (
        <GlobalTranslationRow
          originalText={originalText}
          translatedText={translatedText}
          languageCode={languageCode}
          id={id}
          key={id}
          updateOriginalText={updateOriginalText}
          updateTranslation={updateTranslation}
          deleteOneRow={deleteOneRow}
        />
      ))}
    </form>
  );
};

export default GlobalTranslationsPanel;

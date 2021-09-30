import { Undertittel } from "nav-frontend-typografi";
import GlobalTranslationRow from "./GlobalTranslationRow";
import React from "react";
import { Knapp } from "nav-frontend-knapper";

const GlobalTranslationsPanel = ({
  classes,
  currentTranslation,
  languageCode,
  updateOriginalText,
  updateTranslation,
  deleteOneRow,
  addNewTranslation,
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
      <Knapp className={classes.addButton} onClick={() => addNewTranslation()}>
        Legg til ny tekst
      </Knapp>
    </form>
  );
};

export default GlobalTranslationsPanel;

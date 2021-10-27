import { Undertittel } from "nav-frontend-typografi";
import GlobalTranslationRow from "./GlobalTranslationRow";
import React, { useEffect, useState } from "react";
import { getCurrentOriginalTextList } from "./utils";

const GlobalTranslationsPanel = ({
  classes,
  currentTranslation,
  languageCode,
  updateOriginalText,
  updateTranslation,
  deleteOneRow,
  predefinedGlobalOriginalTexts,
}) => {
  const [currentOriginalTextList, setCurrentOriginalTextList] = useState();
  useEffect(() => {
    setCurrentOriginalTextList(getCurrentOriginalTextList(currentTranslation));
  }, [currentTranslation]);
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
          currentOriginalTextList={currentOriginalTextList}
          predefinedGlobalOriginalTexts={predefinedGlobalOriginalTexts}
        />
      ))}
    </form>
  );
};

export default GlobalTranslationsPanel;

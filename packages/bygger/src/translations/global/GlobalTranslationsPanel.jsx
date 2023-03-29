import { Heading } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import GlobalTranslationRow from "./GlobalTranslationRow";
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
        <Heading level="2" size="small">
          Original
        </Heading>
        <Heading level="2" size="small">
          Oversettelse
        </Heading>
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

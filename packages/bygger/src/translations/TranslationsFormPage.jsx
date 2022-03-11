import { makeStyles } from "@material-ui/styles";
import Ekspanderbartpanel from "nav-frontend-ekspanderbartpanel";
import { Knapp } from "nav-frontend-knapper";
import { Input, Textarea } from "nav-frontend-skjema";
import { Innholdstittel, Sidetittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { languagesInNorwegian, useI18nDispatch } from "../context/i18n";
import TranslationTextInput from "./TranslationTextInput";
import { getInputType } from "./utils";

const useTranslationsListStyles = makeStyles({
  root: {
    width: "80ch",
    margin: "0 auto",
  },
});

const FormItem = ({ currentTranslation, text, type, languageCode }) => {
  const [showGlobalTranslation, setShowGlobalTranslation] = useState(false);
  const [hasGlobalTranslation, setHasGlobalTranslation] = useState(false);
  const [globalTranslation, setGlobalTranslation] = useState("");
  const [tempGlobalTranslation, setTempGlobalTranslation] = useState("");

  const dispatch = useI18nDispatch();

  useEffect(() => {
    if (currentTranslation && currentTranslation[text]) {
      if (currentTranslation[text].scope === "global") {
        setHasGlobalTranslation(true);
        setShowGlobalTranslation(true);
        setTempGlobalTranslation(currentTranslation[text].value);
      }
      setGlobalTranslation(currentTranslation[text].value);
    } else {
      setGlobalTranslation("");
      setHasGlobalTranslation(false);
      setShowGlobalTranslation(false);
    }
  }, [currentTranslation, text]);

  const updateTranslations = (targetValue) => {
    dispatch({
      type: "update",
      payload: { lang: languageCode, translation: { [text]: { value: targetValue, scope: "local" } } },
    });
    setGlobalTranslation(targetValue);
  };

  return (
    <TranslationTextInput
      text={text}
      value={globalTranslation}
      type={type}
      key={`${text}-${languageCode}`}
      hasGlobalTranslation={hasGlobalTranslation}
      tempGlobalTranslation={tempGlobalTranslation}
      showGlobalTranslation={showGlobalTranslation}
      onChange={updateTranslations}
      setHasGlobalTranslation={setHasGlobalTranslation}
      setGlobalTranslation={setGlobalTranslation}
    />
  );
};

const TranslationsToRemove = ({ translations, languageCode }) => {
  const dispatch = useI18nDispatch();
  const onDelete = (key) => {
    dispatch({ type: "remove", payload: { lang: languageCode, key } });
  };
  const unusedTranslationsText = translations.length === 1 ? "ubrukt oversettelse" : "ubrukte oversettelser";
  return (
    <div className="margin-bottom-double">
      <Ekspanderbartpanel
        tittel={`${translations.length} ${unusedTranslationsText} (${languagesInNorwegian[languageCode]})`}
      >
        {translations.map(([originalText, translated]) => (
          <div key={originalText}>
            <div className={"margin-bottom-default"}>
              {getInputType(translated.value) === "textarea" ? (
                <Textarea disabled label={originalText} value={translated.value} maxLength={0} onChange={() => {}} />
              ) : (
                <Input disabled label={originalText} value={translated.value} />
              )}
            </div>
            <Knapp className={"margin-bottom-default"} onClick={() => onDelete(originalText)}>
              Slett
            </Knapp>
          </div>
        ))}
      </Ekspanderbartpanel>
    </div>
  );
};

const TranslationsFormPage = ({ skjemanummer, translations, title, flattenedComponents, languageCode }) => {
  const classes = useTranslationsListStyles();
  const [currentTranslation, setCurrentTranslation] = useState({});
  const [unusedTranslations, setUnusedTranslations] = useState([]);

  useEffect(
    () => setCurrentTranslation((translations[languageCode] && translations[languageCode].translations) || {}),
    [translations, languageCode]
  );

  useEffect(() => {
    const unusedTranslationsAsEntries = Object.entries(
      (translations[languageCode] && translations[languageCode].translations) || {}
    )
      .filter(([_, value]) => value.scope === "local")
      .filter(([key, _]) => !flattenedComponents.some(({ text }) => text === key));
    setUnusedTranslations(unusedTranslationsAsEntries);
  }, [translations, flattenedComponents, languageCode]);

  return (
    <div className={classes.root}>
      <Sidetittel className="margin-bottom-default">{title}</Sidetittel>
      <p className="margin-bottom-large">{skjemanummer}</p>
      {unusedTranslations.length > 0 && (
        <TranslationsToRemove translations={unusedTranslations} languageCode={languageCode} />
      )}
      <Innholdstittel tag={"h2"} className="margin-bottom-default">
        {`Oversettelser${languageCode ? " på " + languagesInNorwegian[languageCode] : ""}`}
      </Innholdstittel>
      <form>
        {flattenedComponents.map(({ text, type }) => {
          return (
            <FormItem
              currentTranslation={currentTranslation}
              text={text}
              type={type}
              key={`translation-${skjemanummer}-${text}-${languageCode}`}
              languageCode={languageCode}
            />
          );
        })}
      </form>
    </div>
  );
};
export default TranslationsFormPage;

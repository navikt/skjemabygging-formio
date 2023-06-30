import { BodyShort, Heading } from "@navikt/ds-react";
import { makeStyles } from "@navikt/skjemadigitalisering-shared-components";
import { useEffect, useState } from "react";
import { languagesInNorwegian, useI18nDispatch } from "../context/i18n";
import ObsoleteTranslationsPanel from "./ObsoleteTranslationsPanel";
import TranslationTextInput from "./TranslationTextInput";

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
  const obsoleteTranslations = translations.map(([originalText, translated]) => ({
    id: originalText,
    originalText,
    translatedText: translated.value,
  }));
  return (
    <ObsoleteTranslationsPanel
      translations={obsoleteTranslations}
      onDelete={(t) => onDelete(t.originalText)}
      className="mb"
    />
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
      <Heading level="1" size="xlarge">
        {title}
      </Heading>
      <BodyShort className="mb">{skjemanummer}</BodyShort>
      {unusedTranslations.length > 0 && (
        <TranslationsToRemove translations={unusedTranslations} languageCode={languageCode} />
      )}
      <Heading level="2" size="large">
        {`Oversettelser${languageCode ? " på " + languagesInNorwegian[languageCode] : ""}`}
      </Heading>
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

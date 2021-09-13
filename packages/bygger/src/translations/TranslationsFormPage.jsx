import React, { useEffect, useState } from "react";
import { Sidetittel } from "nav-frontend-typografi";
import { Input } from "nav-frontend-skjema";
import { makeStyles } from "@material-ui/styles";
import TranslationTextInput from "./TranslationTextInput";

const useTranslationsListStyles = makeStyles({
  root: {
    width: "80ch",
    margin: "0 auto",
  },
});

const FormItem = ({ currentTranslation, setTranslations, text, type, languageCode, translations }) => {
  const [showGlobalTranslation, setShowGlobalTranslation] = useState(false);
  const [hasGlobalTranslation, setHasGlobalTranslation] = useState(false);
  const [globalTranslation, setGlobalTranslation] = useState("");
  const [tempGlobalTranslation, setTempGlobalTranslation] = useState("");

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
  }, [currentTranslation, setTranslations, text]);

  const updateTranslations = (targetValue) => {
    setTranslations({
      ...translations,
      [languageCode]: {
        ...translations[languageCode],
        translations: {
          ...currentTranslation,
          [text]: { value: targetValue, scope: "local" },
        },
      },
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
const TranslationsFormPage = ({
  skjemanummer,
  translations,
  title,
  flattenedComponents,
  setTranslations,
  languageCode,
}) => {
  const classes = useTranslationsListStyles();
  const [currentTranslation, setCurrentTranslation] = useState({});

  useEffect(
    () => setCurrentTranslation((translations[languageCode] && translations[languageCode].translations) || {}),
    [translations, languageCode]
  );

  return (
    <div className={classes.root}>
      <Sidetittel className="margin-bottom-default">{title}</Sidetittel>
      <p className="margin-bottom-large">{skjemanummer}</p>
      <form>
        <Input
          className="margin-bottom-default"
          label={title}
          type={"text"}
          key={`title-${title}`}
          value={(currentTranslation[title] && currentTranslation[title].value) || ""}
          onChange={(event) => {
            setTranslations({
              ...translations,
              [languageCode]: {
                ...translations[languageCode],
                translations: {
                  ...currentTranslation,
                  [title]: { value: event.target.value, scope: "local" },
                },
              },
            });
          }}
        />
        {flattenedComponents.map(({ text, type }) => {
          return (
            <FormItem
              currentTranslation={currentTranslation}
              translations={translations}
              setTranslations={setTranslations}
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

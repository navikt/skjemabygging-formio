import React, { useEffect, useReducer, useState } from "react";
import { AppLayoutWithContext } from "../components/AppLayout";
import LanguageSelector from "../components/LanguageSelector";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { languagesInNorwegian, supportedLanguages } from "../hooks/useLanguages";
import { useHistory } from "react-router-dom";
import { Input } from "nav-frontend-skjema";
import LoadingComponent from "../components/LoadingComponent";
import { makeStyles } from "@material-ui/styles";

const useTranslationRowStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    marginBottom: "2rem",
  },
});

const TranslationRow = ({
  initialOriginalText,
  initialTranslatedText,
  languageCode,
  setTranslations,
  translations,
}) => {
  const [originalText, setOriginalText] = useState(initialOriginalText);
  const [translatedText, setTranslatedText] = useState(initialTranslatedText);
  useEffect(() => {
    if (originalText && originalText !== "") {
      setTranslations({
        ...translations,
        [languageCode]: {
          ...(translations[languageCode] || {}),
          translations: {
            ...((translations[languageCode] && translations[languageCode].translations) || {}),
            [originalText]: { value: translatedText, scope: "global" },
          },
        },
      });
    }
  }, [originalText, translatedText, languageCode, setTranslations, translations]);
  const classes = useTranslationRowStyles();
  return (
    <div className={classes.root}>
      <Input
        className="margin-bottom-default"
        label="Originaltekst"
        type="text"
        value={originalText}
        onChange={(event) => {
          if (event.target.value && event.target.value !== "") {
            setOriginalText(event.target.value);
          }
        }}
      />
      <Input
        className="margin-bottom-default"
        label="Oversatt tekst"
        type="text"
        value={translatedText}
        onChange={(event) => {
          if (event.target.value && event.target.value !== "") {
            setTranslatedText(event.target.value);
          }
        }}
      />
    </div>
  );
};

const GlobalTranslationsPage = ({
  deleteLanguage,
  languageCode = "nn-NO",
  loadGlobalTranslations,
  projectURL,
  saveTranslation,
}) => {
  const history = useHistory();
  const [allGlobalTranslations, setAllGlobalTranslations] = useState({});
  const [availableTranslations, setAvailableTranslations] = useState([]);
  const [currentTranslation, setCurrentTranslation] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "loadNewLanguage":
          return action.newLanguageTranslation;
        case "changeTranslationForText":
          return {
            ...state,
            translations: {
              ...state.translations,
              [action.originalText]: action.translatedText,
            },
          };
        default:
          return state;
      }
    },
    { translations: {} },
    (state) => state
  );

  useEffect(() => {
    loadGlobalTranslations().then((translations) => {
      console.log("GlobalTranslationsPage", translations);
      setAllGlobalTranslations(translations);
      setAvailableTranslations(Object.keys(translations));
      if (translations[languageCode]) {
        setCurrentTranslation({
          ...translations[languageCode],
          translations: {
            ...translations[languageCode].translations,
            "": "",
          },
        });
      }
    });
  }, [languageCode, loadGlobalTranslations]);
  if (Object.keys(allGlobalTranslations).length === 0) {
    return <LoadingComponent />;
  }

  const languages = supportedLanguages
    .filter((languageCode) => languageCode !== "nb-NO")
    .map((languageCode) => ({
      href: `/translation/global/${languageCode}`,
      optionLabel: `${availableTranslations.indexOf(languageCode) === -1 ? `Legg til ` : ""}${
        languagesInNorwegian[languageCode]
      }`,
    }));
  console.log(`Translations (${languageCode}):`, allGlobalTranslations);
  //const currentTranslation = (translations[languageCode] && translations[languageCode].translations) || {};
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Globale oversettelser",
        visSkjemaliste: true,
        visLagNyttSkjema: false,
      }}
      leftCol={
        <>
          <LanguageSelector
            translations={languages.sort((lang1, lang2) =>
              lang1.optionLabel.startsWith("Legg til") ? 1 : lang2.optionLabel.startsWith("Legg til") ? -1 : 0
            )}
          />
          {/*<Knapp onClick={() => deleteLanguage(currentTranslation.id).then(() => history.push("/translations"))}>
              Slett språk
            </Knapp>*/}
        </>
      }
      mainCol={
        <ul className="list-inline">
          <li className="list-inline-item">
            {/*
              <Hovedknapp
                onClick={() =>
                  saveTranslation(projectURL, "global", currentTranslation.id, languageCode, allGlobalTranslations)
                }
              >
                Lagre
              </Hovedknapp>
            */}
          </li>
        </ul>
      }
    >
      <form>
        {Object.keys(currentTranslation).map((originalText) => (
          <TranslationRow
            initialOriginalText={originalText}
            initialTranslatedText={currentTranslation[originalText].value}
            languageCode={languageCode}
            setTranslations={setAllGlobalTranslations}
            translations={allGlobalTranslations}
          />
        ))}
      </form>
    </AppLayoutWithContext>
  );
};

export default GlobalTranslationsPage;

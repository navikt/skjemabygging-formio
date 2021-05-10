import React, { useEffect, useReducer, useState } from "react";
import { AppLayoutWithContext } from "../../components/AppLayout";
import LanguageSelector from "../../components/LanguageSelector";
import { languagesInNorwegian, supportedLanguages } from "../../hooks/useLanguages";
import LoadingComponent from "../../components/LoadingComponent";
import GlobalTranslationRow from "./GlobalTranslationRow";
import { Knapp } from "nav-frontend-knapper";
import { guid } from "../../util/guid";

const GlobalTranslationsPage = ({
  deleteLanguage,
  languageCode = "nn-NO",
  loadGlobalTranslations,
  projectURL,
  saveTranslation,
}) => {
  const [allGlobalTranslations, setAllGlobalTranslations] = useState({});
  const [availableTranslations, setAvailableTranslations] = useState([]);
  const [currentTranslation, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "loadNewLanguage":
          return Object.keys(action.payload.translations).map((originalText) => ({
            id: guid(),
            originalText,
            translatedText: action.payload.translations[originalText].value,
          }));
        case "updateOriginalText":
          return state.map((translationObject) => {
            if (translationObject.id === action.payload.id) {
              return {
                ...translationObject,
                originalText: action.payload.newOriginalText,
              };
            } else {
              return translationObject;
            }
          });
        case "updateTranslation":
          return state.map((translationObject) => {
            if (translationObject.id === action.payload.id) {
              return action.payload;
            } else {
              return translationObject;
            }
          });
        case "addNewTranslation":
          return [
            ...state,
            {
              id: guid(),
              originalText: "",
              translatedText: "",
            },
          ];
        default:
          return state;
      }
    },
    {},
    (state) => state
  );

  useEffect(() => {
    loadGlobalTranslations().then((translations) => {
      setAllGlobalTranslations(translations);
      setAvailableTranslations(Object.keys(translations));
    });
  }, [loadGlobalTranslations]);

  useEffect(() => {
    dispatch({
      type: "loadNewLanguage",
      payload: {
        translations: allGlobalTranslations[languageCode] ? allGlobalTranslations[languageCode].translations : {},
      },
    });
  }, [languageCode, allGlobalTranslations]);

  if (Object.keys(allGlobalTranslations).length === 0) {
    return <LoadingComponent />;
  }

  const languages = supportedLanguages
    .filter((languageCode) => languageCode !== "nb-NO")
    .map((languageCode) => ({
      languageCode,
      href: `/translation/global/${languageCode}`,
      optionLabel: `${availableTranslations.indexOf(languageCode) === -1 ? `Legg til ` : ""}${
        languagesInNorwegian[languageCode]
      }`,
    }));
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
            currentLanguage={languageCode}
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
        {currentTranslation.map(({ id, originalText, translatedText }) => (
          <GlobalTranslationRow
            originalText={originalText}
            translatedText={translatedText}
            languageCode={languageCode}
            key={id}
            updateOriginalText={(newOriginalText, oldOriginalText) =>
              dispatch({
                type: "updateOriginalText",
                payload: {
                  id,
                  newOriginalText,
                  oldOriginalText,
                },
              })
            }
            updateTranslation={(originalText, translatedText) =>
              dispatch({
                type: "updateTranslation",
                payload: {
                  id,
                  originalText,
                  translatedText,
                },
              })
            }
          />
        ))}
      </form>
      <Knapp
        onClick={() =>
          dispatch({
            type: "addNewTranslation",
          })
        }
      >
        Legg til ny tekst
      </Knapp>
    </AppLayoutWithContext>
  );
};

export default GlobalTranslationsPage;

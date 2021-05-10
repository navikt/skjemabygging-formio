import React, { useEffect, useReducer, useState } from "react";
import { AppLayoutWithContext } from "../../components/AppLayout";
import LanguageSelector from "../../components/LanguageSelector";
import { languagesInNorwegian, supportedLanguages } from "../../hooks/useLanguages";
import LoadingComponent from "../../components/LoadingComponent";
import GlobalTranslationRow from "./GlobalTranslationRow";

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
          return action.payload.translations;
        case "updateTranslation":
          return {
            [action.payload.originalText]: action.payload.translatedText,
          };
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
          <GlobalTranslationRow
            originalText={originalText}
            translatedText={currentTranslation[originalText].value}
            languageCode={languageCode}
            updateTranslation={(originalText, translatedText, languageCode) =>
              dispatch({
                type: "updateTranslation",
                payload: {
                  originalText,
                  translatedText,
                  languageCode,
                },
              })
            }
          />
        ))}
      </form>
    </AppLayoutWithContext>
  );
};

export default GlobalTranslationsPage;

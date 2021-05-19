import React, { useEffect, useReducer, useState } from "react";
import { AppLayoutWithContext } from "../../components/AppLayout";
import LanguageSelector from "../../components/LanguageSelector";
import LoadingComponent from "../../components/LoadingComponent";
import GlobalTranslationRow from "./GlobalTranslationRow";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { guid } from "../../util/guid";
import { useHistory } from "react-router-dom";
import { Innholdstittel, Undertittel } from "nav-frontend-typografi";
import { makeStyles } from "@material-ui/styles";
import { Delete } from "@navikt/ds-icons";

const useGlobalTranslationsPageStyles = makeStyles({
  root: {
    maxWidth: "80%",
    margin: "0 auto 2rem",
  },
  title: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "2rem",
    marginBottom: "1rem",
    alignItems: "center",
  },
});

const createNewRow = () => ({
  id: guid(),
  originalText: "",
  translatedText: "",
});

const GlobalTranslationsPage = ({
  deleteLanguage,
  languageCode,
  loadGlobalTranslations,
  projectURL,
  saveTranslation,
}) => {
  const history = useHistory();
  const classes = useGlobalTranslationsPageStyles();
  const [allGlobalTranslations, setAllGlobalTranslations] = useState({});
  const [currentTranslation, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "initializeLanguage": {
          return [createNewRow()];
        }
        case "loadNewLanguage": {
          const newState = Object.keys(action.payload.translations).map((originalText) => ({
            id: guid(),
            originalText,
            translatedText: action.payload.translations[originalText].value,
          }));
          if (newState.length > 0) {
            return newState;
          } else {
            return [createNewRow()];
          }
        }
        case "updateOriginalText": {
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
        }
        case "updateTranslation": {
          return state.map((translationObject) => {
            if (translationObject.id === action.payload.id) {
              return action.payload;
            } else {
              return translationObject;
            }
          });
        }
        case "addNewTranslation": {
          return [...state, createNewRow()];
        }
        case "deleteOneRow": {
          const newState = state.filter((translationObject) => translationObject.id !== action.payload.id);
          if (newState.length > 0) {
            return newState;
          } else {
            return [createNewRow()];
          }
        }
        default: {
          if (state.length > 0) {
            return state;
          } else {
            return [createNewRow()];
          }
        }
      }
    },
    [],
    (state) => state
  );

  useEffect(() => {
    loadGlobalTranslations().then((translations) => {
      if (!languageCode) {
        const firstAvailableLanguageCode = Object.keys(translations)[0];
        if (firstAvailableLanguageCode) {
          history.push(`/translation/global/${firstAvailableLanguageCode}`);
        } else {
          history.push("/translation/global/nn-NO");
        }
      }

      setAllGlobalTranslations(translations);
    });
  }, [loadGlobalTranslations, languageCode, history]);

  useEffect(() => {
    const translationsForLoadedLanguage =
      allGlobalTranslations[languageCode] && allGlobalTranslations[languageCode].translations;
    if (translationsForLoadedLanguage) {
      dispatch({
        type: "loadNewLanguage",
        payload: {
          translations: translationsForLoadedLanguage,
        },
      });
    } else {
      dispatch({
        type: "initializeLanguage",
      });
    }
  }, [languageCode, allGlobalTranslations]);

  if (Object.keys(allGlobalTranslations).length === 0) {
    return <LoadingComponent />;
  }

  const globalTranslationsToSave = currentTranslation.reduce(
    (allCurrentTranslationAsObject, translation) => ({
      ...allCurrentTranslationAsObject,
      [translation.originalText]: {
        scope: "global",
        value: translation.translatedText,
      },
    }),
    {}
  );

  const translationId = allGlobalTranslations[languageCode] && allGlobalTranslations[languageCode].id;
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Globale oversettelser",
        visOversettelseliste: true,
        visLagNyttSkjema: false,
      }}
      leftCol={<LanguageSelector createLink={(languageCode) => `/translation/global/${languageCode}`} />}
      mainCol={
        <ul className="list-inline">
          <li className="list-inline-item">
            <Innholdstittel>{languageCode}</Innholdstittel>
          </li>
          <li className="list-inline-item">
            <Delete />
            {/*<Knapp onClick={() => deleteLanguage(currentTranslation.id).then(() => history.push("/translations"))}>
              Slett språk
            </Knapp>*/}
          </li>
        </ul>
      }
      rightCol={
        <Hovedknapp
          onClick={() => {
            saveTranslation(projectURL, translationId, languageCode, globalTranslationsToSave);
          }}
        >
          Lagre
        </Hovedknapp>
      }
    >
      <div className={classes.root}>
        <form>
          <li className={classes.title}>
            <Undertittel>Original</Undertittel>
            <Undertittel>Oversettelse</Undertittel>
          </li>
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
              deleteOneRow={() =>
                dispatch({
                  type: "deleteOneRow",
                  payload: {
                    id,
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
      </div>
    </AppLayoutWithContext>
  );
};

export default GlobalTranslationsPage;

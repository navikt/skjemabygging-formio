import React, { useEffect, useReducer, useState } from "react";
import { AppLayoutWithContext } from "../../components/AppLayout";
import FormBuilderLanguageSelector from "../../context/i18n/FormBuilderLanguageSelector";
import LoadingComponent from "../../components/LoadingComponent";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { guid } from "../../util/guid";
import { Innholdstittel } from "nav-frontend-typografi";
import { makeStyles } from "@material-ui/styles";
import { Delete } from "@navikt/ds-icons";
import { languagesInNorwegian } from "../../context/i18n";
import { LanguagesProvider } from "../../context/languages";
import i18nData from "../../i18nData";
import useRedirectIfNoLanguageCode from "../../hooks/useRedirectIfNoLanguageCode";
import { useHistory, useParams } from "react-router-dom";
import { ToggleGruppe } from "nav-frontend-toggle";
import GlobalTranslationsPanel from "./GlobalTranslationsPanel";

const useGlobalTranslationsPageStyles = makeStyles({
  root: {
    maxWidth: "80%",
    margin: "0 auto 2rem",
  },
  toggleGruppe: {
    margin: "0 auto 2rem auto",
    width: "fit-content",
  },
  label: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "2rem",
    marginBottom: "1rem",
    alignItems: "center",
  },
  title: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  titleItem: {
    marginRight: "1rem",
    display: "inline-block",
  },
});

const createNewRow = () => ({
  id: guid(),
  originalText: "",
  translatedText: "",
});

const GlobalTranslationsPage = ({
  deleteTranslation,
  languageCode,
  loadGlobalTranslations,
  projectURL,
  saveTranslation,
}) => {
  const { tag } = useParams();
  const [selectedTag, setSelectedTag] = useState("skjematekster");

  useEffect(() => {
    if (tag) {
      setSelectedTag(tag);
    }
  }, [tag]);
  const classes = useGlobalTranslationsPageStyles();
  const [allGlobalTranslations, setAllGlobalTranslations] = useState({});
  const history = useHistory();
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
    loadGlobalTranslations(languageCode, selectedTag).then((translations) => setAllGlobalTranslations(translations));
  }, [loadGlobalTranslations, languageCode, selectedTag]);

  useRedirectIfNoLanguageCode(languageCode, allGlobalTranslations);

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

  if (Object.keys(currentTranslation).length === 0) {
    return <LoadingComponent />;
  }

  const updateOriginalText = (id, newOriginalText, oldOriginalText) => {
    dispatch({
      type: "updateOriginalText",
      payload: {
        id,
        newOriginalText,
        oldOriginalText,
      },
    });
  };

  const updateTranslation = (id, originalText, translatedText) => {
    dispatch({
      type: "updateTranslation",
      payload: {
        id,
        originalText,
        translatedText,
      },
    });
  };

  const deleteOneRow = (id) => {
    dispatch({
      type: "deleteOneRow",
      payload: {
        id,
      },
    });
  };

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
    <LanguagesProvider translations={i18nData}>
      <AppLayoutWithContext
        navBarProps={{
          title: "Globale oversettelser",
          visOversettelseliste: true,
          visLagNyttSkjema: false,
        }}
        leftCol={
          <FormBuilderLanguageSelector formPath="global" languageSelectorLabel={"Velg språk"} tag={selectedTag} />
        }
        mainCol={
          <ul className={classes.title}>
            <li className={classes.titleItem}>
              <Innholdstittel>{languageCode ? languagesInNorwegian[languageCode] : ""}</Innholdstittel>
            </li>
            <li className="list-inline-item">
              <Delete onClick={() => deleteTranslation(translationId).then(() => history.push("/translations"))} />
            </li>
          </ul>
        }
        rightCol={
          <Hovedknapp
            onClick={() => {
              saveTranslation(projectURL, translationId, languageCode, globalTranslationsToSave, selectedTag);
            }}
          >
            Lagre
          </Hovedknapp>
        }
      >
        <div className={classes.root}>
          <ToggleGruppe
            className={classes.toggleGruppe}
            defaultToggles={[
              { children: "Skjematekster", pressed: true },
              { children: "Grensesnitt" },
              { children: "Statiske tekster" },
              { children: "Validering" },
            ]}
            onChange={(event) => {
              const newTag = event.target.innerText.toLowerCase().replace(" ", "-");
              history.push(`/translations/global/${languageCode}/` + newTag);
            }}
          />
          <GlobalTranslationsPanel
            classes={classes}
            currentTranslation={currentTranslation}
            languageCode={languageCode}
            updateOriginalText={updateOriginalText}
            updateTranslation={updateTranslation}
            deleteOneRow={deleteOneRow}
          />
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
    </LanguagesProvider>
  );
};

export default GlobalTranslationsPage;

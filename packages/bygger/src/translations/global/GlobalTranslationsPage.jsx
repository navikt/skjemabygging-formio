import React, { useContext, useEffect, useReducer, useState } from "react";
import { AppLayoutWithContext } from "../../components/AppLayout";
import { guid, LanguagesProvider, i18nData } from "@navikt/skjemadigitalisering-shared-components";
import { TEXTS, objectUtils } from "@navikt/skjemadigitalisering-shared-domain";
import LoadingComponent from "../../components/LoadingComponent";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { Innholdstittel } from "nav-frontend-typografi";
import { makeStyles } from "@material-ui/styles";
import useRedirectIfNoLanguageCode from "../../hooks/useRedirectIfNoLanguageCode";
import { useHistory, useParams } from "react-router-dom";
import { ToggleGruppe } from "nav-frontend-toggle";
import GlobalTranslationsPanel from "./GlobalTranslationsPanel";
import FormBuilderLanguageSelector from "../../context/i18n/FormBuilderLanguageSelector";
import { languagesInNorwegian } from "../../context/i18n";
import Column from "../../components/layout/Column";
import Row from "../../components/layout/Row";
import ApplicationTextTranslationEditPanel from "./ApplicationTextTranslationEditPanel";
import { getInputType } from "../utils";
import { UserAlerterContext } from "../../userAlerting";

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
  titleRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "3rem",
  },
  addButton: {
    maxWidth: "15rem",
  },
  mainCol: {
    gridColumn: "2 / 3",
  },
});

const tags = {
  SKJEMATEKSTER: "skjematekster",
  GRENSESNITT: "grensesnitt",
  STATISKE_TEKSTER: "statiske-tekster",
  VALIDERING: "validering",
};

const createNewRow = (originalText = "", translatedText = "") => ({
  id: guid(),
  originalText,
  translatedText,
});

const GlobalTranslationsPage = ({
  deleteTranslation,
  languageCode,
  loadGlobalTranslations,
  projectURL,
  saveTranslation,
}) => {
  const { tag } = useParams();
  const [selectedTag, setSelectedTag] = useState(tags.SKJEMATEKSTER);

  const alertComponent = useContext(UserAlerterContext).alertComponent();

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
          const { id, originalText, translatedText } = action.payload;
          if (id === "") {
            return [...state, createNewRow(originalText, translatedText)];
          }
          return state.map((translation) => (translation.id === id ? action.payload : translation));
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

  const globalTranslationsToSave = () =>
    currentTranslation.reduce(
      (allCurrentTranslationAsObject, translation) => ({
        ...allCurrentTranslationAsObject,
        [translation.originalText]: {
          scope: "global",
          value: translation.translatedText,
        },
      }),
      {}
    );

  const flattenTextsForEditPanel = (texts) => {
    return objectUtils.flattenToArray(texts, (entry, parentKey) => {
      const key = objectUtils.concatKeys(entry[0], parentKey);
      const text = entry[1];
      return { key, text, type: getInputType(text) };
    });
  };

  function getApplicationTexts(tag) {
    const { grensesnitt, statiske, validering, common } = TEXTS;
    switch (tag) {
      case tags.GRENSESNITT:
        return flattenTextsForEditPanel({ ...grensesnitt, ...common });
      case tags.STATISKE_TEKSTER:
        return flattenTextsForEditPanel(statiske);
      case tags.VALIDERING:
        return flattenTextsForEditPanel(validering);
      default:
        return [];
    }
  }

  const translationId = allGlobalTranslations[languageCode] && allGlobalTranslations[languageCode].id;
  return (
    <LanguagesProvider translations={i18nData}>
      <AppLayoutWithContext
        navBarProps={{
          title: "Globale oversettelser",
          visOversettelseliste: true,
          visLagNyttSkjema: false,
        }}
      >
        <ToggleGruppe
          className={classes.toggleGruppe}
          defaultToggles={[
            {
              children: "Skjematekster",
              "data-key": tags.SKJEMATEKSTER,
              pressed: selectedTag === tags.SKJEMATEKSTER,
            },
            { children: "Grensesnitt", "data-key": tags.GRENSESNITT, pressed: selectedTag === tags.GRENSESNITT },
            {
              children: "Statiske tekster",
              "data-key": tags.STATISKE_TEKSTER,
              pressed: selectedTag === tags.STATISKE_TEKSTER,
            },
            { children: "Validering", "data-key": tags.VALIDERING, pressed: selectedTag === tags.VALIDERING },
          ]}
          onChange={(event) => {
            const newTag = event.target.getAttribute("data-key");
            history.push(`/translations/global/${languageCode}/${newTag}`);
          }}
        />
        <Row className={classes.titleRow}>
          {languageCode && <Innholdstittel>{languagesInNorwegian[languageCode]}</Innholdstittel>}
        </Row>
        <Row>
          <Column className={classes.mainCol}>
            {selectedTag === tags.SKJEMATEKSTER ? (
              <GlobalTranslationsPanel
                classes={classes}
                currentTranslation={currentTranslation}
                languageCode={languageCode}
                updateOriginalText={updateOriginalText}
                updateTranslation={updateTranslation}
                deleteOneRow={deleteOneRow}
              />
            ) : (
              <ApplicationTextTranslationEditPanel
                classes={classes}
                texts={getApplicationTexts(selectedTag)}
                translations={currentTranslation}
                languageCode={languageCode}
                updateTranslation={updateTranslation}
              />
            )}
            <Knapp
              className={classes.addButton}
              onClick={() =>
                dispatch({
                  type: "addNewTranslation",
                })
              }
            >
              Legg til ny tekst
            </Knapp>
          </Column>
          <Column>
            <FormBuilderLanguageSelector formPath="global" tag={selectedTag} />
            <Knapp onClick={() => deleteTranslation(translationId).then(() => history.push("/translations"))}>
              Slett språk
            </Knapp>
            <Hovedknapp
              onClick={() =>
                saveTranslation(projectURL, translationId, languageCode, globalTranslationsToSave(), selectedTag)
              }
            >
              Lagre
            </Hovedknapp>
            {alertComponent && <aside aria-live="polite">{alertComponent()}</aside>}
          </Column>
        </Row>
      </AppLayoutWithContext>
    </LanguagesProvider>
  );
};

export default GlobalTranslationsPage;

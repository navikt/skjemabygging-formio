import React, { useContext, useEffect, useMemo, useReducer, useState } from "react";
import { AppLayoutWithContext } from "../../components/AppLayout";
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
import { UserAlerterContext } from "../../userAlerting";
import getCurrenttranslationsReducer from "./getCurrenttranslationsReducer";
import { getAllPredefinedOriginalTexts, getCurrentOriginalTextList, tags } from "./utils";

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
  sideBarContainer: {
    height: "100%",
  },
  stickySideBar: {
    position: "sticky",
    top: "7rem",
  },
});

const GlobalTranslationsPage = ({
  deleteTranslation,
  languageCode,
  loadGlobalTranslations,
  publishGlobalTranslations,
  projectURL,
  saveTranslation,
  onLogout,
}) => {
  const { tag } = useParams();
  const [selectedTag, setSelectedTag] = useState(tags.SKJEMATEKSTER);
  const [publishing, setPublishing] = useState(false);

  const publish = () => {
    setPublishing(true);
    publishGlobalTranslations(languageCode).finally(() => setPublishing(false));
  };

  const alertComponent = useContext(UserAlerterContext).alertComponent();

  useEffect(() => {
    if (tag) {
      setSelectedTag(tag);
    }
  }, [tag]);
  const classes = useGlobalTranslationsPageStyles();
  const [allGlobalTranslations, setAllGlobalTranslations] = useState({});
  const [globalTranslationsWithLanguagecodeAndTag, setGlobalTranslationsWithLanguagecodeAndTag] = useState({});
  const history = useHistory();
  const [currentTranslation, dispatch] = useReducer(
    (state, action) => getCurrenttranslationsReducer(state, action),
    [],
    (state) => state
  );

  const getGlobalTranslationsWithLanguageAndTag = (allGlobalTranslations, languageCode, selectedTag) => {
    const indexOfTranslationWithTag = allGlobalTranslations[languageCode].findIndex(
      (globalTranslations) => globalTranslations.tag === selectedTag
    );
    return allGlobalTranslations[languageCode][indexOfTranslationWithTag];
  };

  useEffect(() => {
    loadGlobalTranslations(languageCode).then((translations) => setAllGlobalTranslations(translations));
  }, [loadGlobalTranslations, languageCode]);

  useEffect(() => {
    if (languageCode && allGlobalTranslations[languageCode])
      setGlobalTranslationsWithLanguagecodeAndTag(
        getGlobalTranslationsWithLanguageAndTag(allGlobalTranslations, languageCode, selectedTag)
      );
    else setGlobalTranslationsWithLanguagecodeAndTag({});
  }, [allGlobalTranslations, languageCode, selectedTag]);

  useRedirectIfNoLanguageCode(languageCode, allGlobalTranslations);

  useEffect(() => {
    const translationsForLoadedLanguage =
      globalTranslationsWithLanguagecodeAndTag && globalTranslationsWithLanguagecodeAndTag.translations;
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
  }, [globalTranslationsWithLanguagecodeAndTag]);

  const predefinedOriginalTextList = useMemo(() => getAllPredefinedOriginalTexts(), []);
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

  const addNewTranslation = () => {
    dispatch({
      type: "addNewTranslation",
    });
  };

  const getTranslationIdsForLanguage = () => {
    return allGlobalTranslations[languageCode].reduce((translationId, translations) => {
      const { id } = translations;
      return [...translationId, id];
    }, []);
  };

  const globalTranslationsToSave = () => {
    return currentTranslation.reduce((allCurrentTranslationAsObject, translation) => {
      if (translation.originalText !== "" && translation.translatedText !== "") {
        return {
          ...allCurrentTranslationAsObject,
          [translation.originalText]: {
            scope: "global",
            value: translation.translatedText,
          },
        };
      }
      return allCurrentTranslationAsObject;
    }, {});
  };

  const hasDuplicatedOriginalText = () => {
    return getCurrentOriginalTextList(currentTranslation).filter((originalText, index, array) => {
      if (predefinedOriginalTextList.indexOf(originalText) >= 0) return originalText;
      return array.indexOf(originalText) !== index;
    });
  };

  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Globale oversettelser",
        visOversettelseliste: true,
        visLagNyttSkjema: false,
        logout: onLogout,
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
        <Innholdstittel>
          {languageCode && languageCode !== "undefined" ? languagesInNorwegian[languageCode] : ""}
        </Innholdstittel>
      </Row>
      <Row>
        <Column className={classes.mainCol}>
          {selectedTag === tags.SKJEMATEKSTER ? (
            <div>
              <GlobalTranslationsPanel
                classes={classes}
                currentTranslation={currentTranslation}
                languageCode={languageCode}
                updateOriginalText={updateOriginalText}
                updateTranslation={updateTranslation}
                deleteOneRow={deleteOneRow}
                predefinedGlobalOriginalTexts={predefinedOriginalTextList}
              />
              <Knapp className={classes.addButton} onClick={() => addNewTranslation()}>
                Legg til ny tekst
              </Knapp>
            </div>
          ) : (
            <ApplicationTextTranslationEditPanel
              classes={classes}
              selectedTag={selectedTag}
              translations={currentTranslation}
              languageCode={languageCode}
              updateTranslation={updateTranslation}
            />
          )}
        </Column>
        <div className={classes.sideBarContainer}>
          <Column className={classes.stickySideBar}>
            <FormBuilderLanguageSelector formPath="global" tag={selectedTag} />
            <Knapp
              onClick={() => {
                if (allGlobalTranslations[languageCode]) {
                  getTranslationIdsForLanguage().forEach((translationId) => deleteTranslation(translationId));
                  history.push("/translations");
                }
              }}
            >
              Slett språk
            </Knapp>
            <Knapp onClick={publish} spinner={publishing}>
              Publiser
            </Knapp>
            <Hovedknapp
              onClick={() => {
                if (selectedTag === tags.SKJEMATEKSTER && hasDuplicatedOriginalText().length > 0) {
                  const duplicatedOriginalText = hasDuplicatedOriginalText();
                  alert(
                    `Du har fortsatt ${
                      duplicatedOriginalText.length > 1
                        ? "flere dupliserte original tekster"
                        : "en duplisert original tekst"
                    } (${duplicatedOriginalText})`
                  );
                } else {
                  saveTranslation(
                    projectURL,
                    globalTranslationsWithLanguagecodeAndTag?.id,
                    languageCode,
                    globalTranslationsToSave(),
                    selectedTag
                  );
                }
              }}
            >
              Lagre
            </Hovedknapp>
            {alertComponent && <aside aria-live="polite">{alertComponent()}</aside>}
          </Column>
        </div>
      </Row>
    </AppLayoutWithContext>
  );
};

export default GlobalTranslationsPage;

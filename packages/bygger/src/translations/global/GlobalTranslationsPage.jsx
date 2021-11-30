import { makeStyles } from "@material-ui/styles";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { ToggleGruppe } from "nav-frontend-toggle";
import { Innholdstittel } from "nav-frontend-typografi";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { AppLayoutWithContext } from "../../components/AppLayout";
import Column from "../../components/layout/Column";
import Row from "../../components/layout/Row";
import LoadingComponent from "../../components/LoadingComponent";
import UserFeedback from "../../components/UserFeedback";
import { languagesInNorwegian } from "../../context/i18n";
import FormBuilderLanguageSelector from "../../context/i18n/FormBuilderLanguageSelector";
import useRedirectIfNoLanguageCode from "../../hooks/useRedirectIfNoLanguageCode";
import { useModal } from "../../util/useModal";
import ConfirmDeleteLanguageModal from "../ConfirmDeleteLanguageModal";
import ApplicationTextTranslationEditPanel from "./ApplicationTextTranslationEditPanel";
import getCurrenttranslationsReducer from "./getCurrenttranslationsReducer";
import GlobalTranslationsPanel from "./GlobalTranslationsPanel";
import {
  getAllPredefinedOriginalTexts,
  getCurrentOriginalTextList,
  getGlobalTranslationsWithLanguageAndTag,
  tags,
} from "./utils";

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
  const params = useParams();
  const tag = params.tag || tags.SKJEMATEKSTER;
  const [publishing, setPublishing] = useState(false);
  const [isDeleteLanguageModalOpen, setIsDeleteLanguageModalOpen] = useModal();

  const publish = () => {
    setPublishing(true);
    publishGlobalTranslations(languageCode).finally(() => setPublishing(false));
  };
  const classes = useGlobalTranslationsPageStyles();
  const [allGlobalTranslations, setAllGlobalTranslations] = useState({});
  const [globalTranslationsWithLanguagecodeAndTag, setGlobalTranslationsWithLanguagecodeAndTag] = useState({});
  const history = useHistory();
  const [currentTranslation, dispatch] = useReducer(
    (state, action) => getCurrenttranslationsReducer(state, action),
    [],
    (state) => state
  );

  useEffect(() => {
    loadGlobalTranslations().then((translations) => setAllGlobalTranslations(translations));
  }, [loadGlobalTranslations]);

  useEffect(() => {
    if (languageCode && allGlobalTranslations[languageCode])
      setGlobalTranslationsWithLanguagecodeAndTag(
        getGlobalTranslationsWithLanguageAndTag(allGlobalTranslations, languageCode, tag)
      );
    else setGlobalTranslationsWithLanguagecodeAndTag({});
  }, [allGlobalTranslations, languageCode, tag]);

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

  const globalTranslationsToSave = (tag) => {
    return currentTranslation.reduce((allCurrentTranslationAsObject, translation) => {
      if (translation.originalText !== "" && translation.translatedText !== "") {
        let originalTextOrKey = translation.originalText;
        if (tag === tags.VALIDERING) {
          Object.entries(TEXTS.validering).forEach(([key, value]) => {
            if (translation.originalText === value) {
              originalTextOrKey = key;
            }
          });
        }

        return {
          ...allCurrentTranslationAsObject,
          [originalTextOrKey]: {
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
    <>
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
              pressed: tag === tags.SKJEMATEKSTER,
            },
            { children: "Grensesnitt", "data-key": tags.GRENSESNITT, pressed: tag === tags.GRENSESNITT },
            {
              children: "Statiske tekster",
              "data-key": tags.STATISKE_TEKSTER,
              pressed: tag === tags.STATISKE_TEKSTER,
            },
            { children: "Validering", "data-key": tags.VALIDERING, pressed: tag === tags.VALIDERING },
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
            {tag === tags.SKJEMATEKSTER ? (
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
                selectedTag={tag}
                translations={currentTranslation}
                languageCode={languageCode}
                updateTranslation={updateTranslation}
              />
            )}
          </Column>
          <div className={classes.sideBarContainer}>
            <Column className={classes.stickySideBar}>
              <FormBuilderLanguageSelector formPath="global" tag={tag} />
              <Knapp onClick={() => setIsDeleteLanguageModalOpen(true)}>Slett språk</Knapp>
              <Knapp onClick={publish} spinner={publishing}>
                Publiser
              </Knapp>
              <Hovedknapp
                onClick={() => {
                  if (tag === tags.SKJEMATEKSTER && hasDuplicatedOriginalText().length > 0) {
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
                      globalTranslationsToSave(tag),
                      tag
                    );
                  }
                }}
              >
                Lagre
              </Hovedknapp>
              <UserFeedback />
            </Column>
          </div>
        </Row>
      </AppLayoutWithContext>
      <ConfirmDeleteLanguageModal
        isOpen={isDeleteLanguageModalOpen}
        closeModal={() => setIsDeleteLanguageModalOpen(false)}
        onConfirm={() => {
          if (allGlobalTranslations[languageCode]) {
            getTranslationIdsForLanguage().forEach((translationId) => deleteTranslation(translationId));
            history.push("/translations");
          }
        }}
        language={languagesInNorwegian[languageCode]}
        isGlobal={true}
      />
    </>
  );
};

export default GlobalTranslationsPage;

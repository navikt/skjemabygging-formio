import { makeStyles } from "@material-ui/styles";
import { Heading } from "@navikt/ds-react";
import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Knapp } from "nav-frontend-knapper";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { AppLayout } from "../../components/AppLayout";
import Column from "../../components/layout/Column";
import Row from "../../components/layout/Row";
import PrimaryButtonWithSpinner from "../../components/PrimaryButtonWithSpinner";
import UserFeedback from "../../components/UserFeedback";
import { getAvailableLanguages, languagesInNorwegian } from "../../context/i18n";
import FormBuilderLanguageSelector from "../../context/i18n/FormBuilderLanguageSelector";
import useRedirectIfNoLanguageCode from "../../hooks/useRedirectIfNoLanguageCode";
import { useModal } from "../../util/useModal";
import ConfirmDeleteLanguageModal from "../ConfirmDeleteLanguageModal";
import ApplicationTextTranslationEditPanel from "./ApplicationTextTranslationEditPanel";
import getCurrenttranslationsReducer from "./getCurrenttranslationsReducer";
import GlobalCsvLink from "./GlobalCsvLink";
import GlobalTranslationsPanel from "./GlobalTranslationsPanel";
import PublishGlobalTranslationsButton from "./PublishGlobalTranslationsButton";
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
  saveTranslation,
}) => {
  const params = useParams();
  const selectedTag = params.tag || tags.SKJEMATEKSTER;
  const [isDeleteLanguageModalOpen, setIsDeleteLanguageModalOpen] = useModal();

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

  const languages = useMemo(() => getAvailableLanguages(allGlobalTranslations), [allGlobalTranslations]);
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

  const globalTranslationsToSave = (selectedTag) => {
    return currentTranslation.reduce((allCurrentTranslationAsObject, translation) => {
      if (translation.originalText !== "" && translation.translatedText !== "") {
        let originalTextOrKey = translation.originalText;
        if (selectedTag === tags.VALIDERING) {
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

  const onSaveGlobalTranslations = async () => {
    if (selectedTag === tags.SKJEMATEKSTER && hasDuplicatedOriginalText().length > 0) {
      const duplicatedOriginalText = hasDuplicatedOriginalText();
      alert(
        `Du har fortsatt ${
          duplicatedOriginalText.length > 1 ? "flere dupliserte original tekster" : "en duplisert original tekst"
        } (${duplicatedOriginalText})`
      );
    } else {
      const response = await saveTranslation(
        globalTranslationsWithLanguagecodeAndTag?.id,
        languageCode,
        globalTranslationsToSave(selectedTag),
        selectedTag
      );
      if (response.ok) {
        const translations = await loadGlobalTranslations();
        setAllGlobalTranslations(translations);
      }
      return response;
    }
  };

  return (
    <>
      <AppLayout
        navBarProps={{
          title: "Globale oversettelser",
          visOversettelseliste: true,
          visLagNyttSkjema: false,
          visOversettelsesMeny: true,
        }}
      >
        <Row className={classes.titleRow}>
          <Heading level="1" size="large">
            {languageCode && languageCode !== "undefined" ? languagesInNorwegian[languageCode] : ""}
          </Heading>
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
                deleteOneRow={deleteOneRow}
              />
            )}
          </Column>
          <div className={classes.sideBarContainer}>
            <Column className={classes.stickySideBar}>
              <FormBuilderLanguageSelector languages={languages} formPath="global" tag={selectedTag} />
              <Knapp onClick={() => setIsDeleteLanguageModalOpen(true)}>Slett språk</Knapp>
              <PublishGlobalTranslationsButton
                languageCode={languageCode}
                publishGlobalTranslations={publishGlobalTranslations}
              />
              <PrimaryButtonWithSpinner onClick={onSaveGlobalTranslations}>Lagre</PrimaryButtonWithSpinner>
              <UserFeedback />
              <GlobalCsvLink allGlobalTranslations={allGlobalTranslations} languageCode={languageCode} />
            </Column>
          </div>
        </Row>
      </AppLayout>
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

import React, { useContext, useEffect, useReducer, useState } from "react";
import { AppLayoutWithContext } from "../../components/AppLayout";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
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
import getCurrenttranslationsReducer from "./getCurrenttranslationsReducer.ts";
import { flattenTextsForEditPanel, getAllPredefinedOriginalTexts } from "./utils";

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

  const getCurrentOriginalTextList = () => {
    return currentTranslation.reduce((originalTextList, translations) => {
      const { originalText } = translations;
      if (originalText !== "") return [...originalTextList, originalText.toUpperCase()];
      else return originalTextList;
    }, []);
  };

  const hasDuplicatedOriginalText = () => {
    const originalTextList = Object.keys(globalTranslationsToSave()).map((text) => text.toUpperCase());
    return originalTextList.some(
      (translation) =>
        getAllPredefinedOriginalTexts().indexOf(translation.toUpperCase()) >= 0 ||
        originalTextList.filter((originalText) => originalText === translation.toUpperCase()).length > 1
    );
  };

  return (
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
                currentOriginalTextList={getCurrentOriginalTextList()}
              />
              <Knapp className={classes.addButton} onClick={() => addNewTranslation()}>
                Legg til ny tekst
              </Knapp>
            </div>
          ) : (
            <ApplicationTextTranslationEditPanel
              classes={classes}
              texts={getApplicationTexts(selectedTag)}
              translations={currentTranslation}
              languageCode={languageCode}
              updateTranslation={updateTranslation}
            />
          )}
        </Column>
        <Column>
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
          <Hovedknapp
            onClick={() =>
              saveTranslation(
                projectURL,
                globalTranslationsWithLanguagecodeAndTag?.id,
                languageCode,
                globalTranslationsToSave(),
                selectedTag,
                selectedTag === tags.SKJEMATEKSTER ? hasDuplicatedOriginalText() : false
              )
            }
          >
            Lagre
          </Hovedknapp>
          {alertComponent && <aside aria-live="polite">{alertComponent()}</aside>}
        </Column>
      </Row>
    </AppLayoutWithContext>
  );
};

export default GlobalTranslationsPage;

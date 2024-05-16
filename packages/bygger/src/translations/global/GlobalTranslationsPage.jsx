import { Button, Heading } from '@navikt/ds-react';
import { LoadingComponent, makeStyles, useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import ButtonWithSpinner from '../../components/ButtonWithSpinner';
import UserFeedback from '../../components/UserFeedback';
import Column from '../../components/layout/Column';
import Row from '../../components/layout/Row';
import { getAvailableLanguages, languagesInNorwegian } from '../../context/i18n';
import FormBuilderLanguageSelector from '../../context/i18n/FormBuilderLanguageSelector';
import useRedirectIfNoLanguageCode from '../../hooks/useRedirectIfNoLanguageCode';
import ConfirmDeleteLanguageModal from '../ConfirmDeleteLanguageModal';
import ApplicationTextTranslationEditPanel from './ApplicationTextTranslationEditPanel';
import GlobalCsvLink from './GlobalCsvLink';
import GlobalTranslationsPanel from './GlobalTranslationsPanel';
import PublishGlobalTranslationsButton from './PublishGlobalTranslationsButton';
import getCurrenttranslationsReducer from './getCurrenttranslationsReducer';
import {
  getAllPredefinedOriginalTexts,
  getCurrentOriginalTextList,
  getGlobalTranslationsWithLanguageAndTag,
  tags,
} from './utils';

const useStyles = makeStyles({
  root: {
    maxWidth: '80%',
    margin: '0 auto 2rem',
  },
  toggleGruppe: {
    margin: '0 auto 2rem auto',
    width: 'fit-content',
  },
  label: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: '2rem',
    marginBottom: '1rem',
    alignItems: 'center',
  },
  addButton: {
    maxWidth: '15rem',
  },
  mainCol: {
    gridColumn: '2 / 3',
  },
  sideBarContainer: {
    height: '100%',
  },
  stickySideBar: {
    position: 'sticky',
    top: '7rem',
  },
});

const GlobalTranslationsPage = ({
  deleteTranslation,
  loadGlobalTranslations,
  publishGlobalTranslations,
  saveTranslation,
  importFromProduction,
}) => {
  const { tag, languageCode } = useParams();
  const { config } = useAppConfig();
  const selectedTag = tag || tags.SKJEMATEKSTER;
  const [isDeleteLanguageModalOpen, setIsDeleteLanguageModalOpen] = useModal();

  const styles = useStyles();
  const [allGlobalTranslations, setAllGlobalTranslations] = useState({});
  const [globalTranslationsWithLanguagecodeAndTag, setGlobalTranslationsWithLanguagecodeAndTag] = useState({});
  const navigate = useNavigate();
  const [currentTranslation, dispatch] = useReducer(
    (state, action) => getCurrenttranslationsReducer(state, action),
    [],
    (state) => state,
  );

  useEffect(() => {
    loadGlobalTranslations()
      .then((translations) => setAllGlobalTranslations(translations))
      .catch(() => {});
  }, [loadGlobalTranslations]);

  useEffect(() => {
    if (languageCode && allGlobalTranslations[languageCode])
      setGlobalTranslationsWithLanguagecodeAndTag(
        getGlobalTranslationsWithLanguageAndTag(allGlobalTranslations, languageCode, selectedTag),
      );
    else setGlobalTranslationsWithLanguagecodeAndTag({});
  }, [allGlobalTranslations, languageCode, selectedTag]);

  useRedirectIfNoLanguageCode(languageCode, allGlobalTranslations);

  useEffect(() => {
    const translationsForLoadedLanguage =
      globalTranslationsWithLanguagecodeAndTag && globalTranslationsWithLanguagecodeAndTag.translations;
    if (translationsForLoadedLanguage) {
      dispatch({
        type: 'loadNewLanguage',
        payload: {
          translations: translationsForLoadedLanguage,
        },
      });
    } else {
      dispatch({
        type: 'initializeLanguage',
      });
    }
  }, [globalTranslationsWithLanguagecodeAndTag]);

  const importFromProd = useCallback(async () => {
    await importFromProduction(languageCode);
    return loadGlobalTranslations()
      .then((translations) => setAllGlobalTranslations(translations))
      .catch(() => {});
  }, [importFromProduction, loadGlobalTranslations, languageCode]);

  const languages = useMemo(() => getAvailableLanguages(allGlobalTranslations), [allGlobalTranslations]);
  const predefinedOriginalTextList = useMemo(() => getAllPredefinedOriginalTexts(), []);
  if (Object.keys(currentTranslation).length === 0) {
    return <LoadingComponent />;
  }

  const updateOriginalText = (id, newOriginalText, oldOriginalText) => {
    dispatch({
      type: 'updateOriginalText',
      payload: {
        id,
        newOriginalText,
        oldOriginalText,
      },
    });
  };

  const updateTranslation = (id, originalText, translatedText) => {
    dispatch({
      type: 'updateTranslation',
      payload: {
        id,
        originalText,
        translatedText,
      },
    });
  };

  const deleteOneRow = (id) => {
    dispatch({
      type: 'deleteOneRow',
      payload: {
        id,
      },
    });
  };

  const addNewTranslation = () => {
    dispatch({
      type: 'addNewTranslation',
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
      if (translation.originalText !== '' && translation.translatedText !== '') {
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
            scope: 'global',
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
          duplicatedOriginalText.length > 1 ? 'flere dupliserte original tekster' : 'en duplisert original tekst'
        } (${duplicatedOriginalText})`,
      );
    } else {
      const response = await saveTranslation(
        globalTranslationsWithLanguagecodeAndTag?.id,
        languageCode,
        globalTranslationsToSave(selectedTag),
        selectedTag,
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
          title: 'Globale oversettelser',
          visOversettelseliste: true,
          visLagNyttSkjema: false,
          visOversettelsesMeny: true,
        }}
      >
        <Row>
          <Column className={styles.mainCol}>
            <Heading level="1" size="xlarge" className="mb-14">
              {languageCode && languageCode !== 'undefined' ? languagesInNorwegian[languageCode] : ''}
            </Heading>

            {selectedTag === tags.SKJEMATEKSTER ? (
              <div>
                <GlobalTranslationsPanel
                  classes={styles}
                  currentTranslation={currentTranslation}
                  languageCode={languageCode}
                  updateOriginalText={updateOriginalText}
                  updateTranslation={updateTranslation}
                  deleteOneRow={deleteOneRow}
                  predefinedGlobalOriginalTexts={predefinedOriginalTextList}
                />
                <Button
                  variant="secondary"
                  className={styles.addButton}
                  onClick={() => addNewTranslation()}
                  type="button"
                >
                  Legg til ny tekst
                </Button>
              </div>
            ) : (
              <ApplicationTextTranslationEditPanel
                classes={styles}
                selectedTag={selectedTag}
                translations={currentTranslation}
                languageCode={languageCode}
                updateTranslation={updateTranslation}
                deleteOneRow={deleteOneRow}
              />
            )}
          </Column>
          <div className={styles.sideBarContainer}>
            <Column className={styles.stickySideBar}>
              <FormBuilderLanguageSelector languages={languages} formPath="global" tag={selectedTag} />
              <ButtonWithSpinner onClick={onSaveGlobalTranslations} size="small">
                Lagre
              </ButtonWithSpinner>
              <PublishGlobalTranslationsButton
                languageCode={languageCode}
                publishGlobalTranslations={publishGlobalTranslations}
              />
              <GlobalCsvLink allGlobalTranslations={allGlobalTranslations} languageCode={languageCode} />
              {!config?.isProdGcp && (
                <ButtonWithSpinner variant="tertiary" onClick={importFromProd} size="small">
                  Kopier fra produksjon
                </ButtonWithSpinner>
              )}
              <Button variant="tertiary" onClick={() => setIsDeleteLanguageModalOpen(true)} type="button" size="small">
                Slett språk
              </Button>
              <UserFeedback />
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
            navigate('/translations');
          }
        }}
        language={languagesInNorwegian[languageCode]}
        isGlobal={true}
      />
    </>
  );
};

export default GlobalTranslationsPage;

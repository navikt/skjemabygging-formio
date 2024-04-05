import { LoadingComponent, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import ButtonWithSpinner from '../components/ButtonWithSpinner';
import UserFeedback from '../components/UserFeedback';
import Column from '../components/layout/Column';
import Row from '../components/layout/Row';
import { getAvailableLanguages, useI18nDispatch, useI18nState } from '../context/i18n';
import FormBuilderLanguageSelector from '../context/i18n/FormBuilderLanguageSelector';
import useRedirectIfNoLanguageCode from '../hooks/useRedirectIfNoLanguageCode';
import TranslationsFormPage from './TranslationsFormPage';
import { getFormTexts, getTextsAndTranslationsForForm, getTextsAndTranslationsHeaders } from './utils';

interface TranslationsByFormPageProps {
  loadForm: any;
  saveTranslation: any;
}

const useStyles = makeStyles({
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

const TranslationsByFormPage = ({ loadForm, saveTranslation }: TranslationsByFormPageProps) => {
  const { formPath, languageCode = '' } = useParams();
  const [form, setForm] = useState<NavFormType>();
  const [status, setStatus] = useState('LOADING');
  const { translations, status: translationStatus } = useI18nState();
  const languages = useMemo(() => getAvailableLanguages(translations), [translations]);
  const dispatch = useI18nDispatch();

  useRedirectIfNoLanguageCode(languageCode, translations);

  useEffect(() => {
    loadForm(formPath)
      .then((form) => {
        setForm(form);
        setStatus('FINISHED LOADING');
      })
      .catch((e) => {
        console.log(e);
        setStatus('FORM NOT FOUND');
      });
  }, [loadForm, formPath]);

  const flattenedComponents = getFormTexts(form, true);
  const translationId = translations[languageCode]?.id;
  const styles = useStyles();

  const onSave = async () => {
    const savedTranslation = await saveTranslation(
      translationId,
      languageCode,
      translations[languageCode]?.translations,
      path,
      title,
    );

    if (!translationId && savedTranslation._id) {
      dispatch({
        type: 'updateLanguageId',
        payload: {
          id: savedTranslation._id,
          lang: languageCode,
        },
      });
    }
  };

  if (status === 'LOADING' || translationStatus === 'LOADING') {
    return <LoadingComponent />;
  }

  if (status === 'FORM NOT FOUND' || !form) {
    return <h1>Vi fant ikke dette skjemaet...</h1>;
  }

  const {
    title,
    path,
    properties: { skjemanummer },
  } = form;

  return (
    <>
      <AppLayout
        navBarProps={{
          title: 'Rediger oversettelse',
          visSkjemaliste: false,
          visLagNyttSkjema: false,
          visOversettelseliste: true,
          visSkjemaMeny: true,
          formPath: form.path,
        }}
      >
        <Row>
          <Column className={styles.mainCol}>
            <TranslationsFormPage
              skjemanummer={skjemanummer}
              translations={translations}
              languageCode={languageCode}
              title={title}
              flattenedComponents={flattenedComponents}
            />
          </Column>
          <div className={styles.sideBarContainer}>
            <Column className={styles.stickySideBar}>
              <FormBuilderLanguageSelector languages={languages} formPath={path} />
              <ButtonWithSpinner onClick={onSave}>Lagre</ButtonWithSpinner>
              <UserFeedback />
              <CSVLink
                data={getTextsAndTranslationsForForm(form, translations)}
                filename={`${title}(${path})_Oversettelser.csv`}
                className="navds-button navds-button--secondary navds-label"
                separator={';'}
                headers={getTextsAndTranslationsHeaders(translations)}
                enclosingCharacter={'"'}
              >
                Eksporter
              </CSVLink>
            </Column>
          </div>
        </Row>
      </AppLayout>
    </>
  );
};

export default TranslationsByFormPage;

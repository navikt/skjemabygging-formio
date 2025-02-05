import { VStack } from '@navikt/ds-react';
import { LoadingComponent } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import ButtonWithSpinner from '../components/ButtonWithSpinner';
import RowLayout from '../components/layout/RowLayout';
import SidebarLayout from '../components/layout/SidebarLayout';
import Title from '../components/layout/Title';
import TitleRowLayout from '../components/layout/TitleRowLayout';
import UserFeedback from '../components/UserFeedback';
import { getAvailableLanguages, useI18nDispatch, useI18nState } from '../context/i18n';
import FormBuilderLanguageSelector from '../context/i18n/FormBuilderLanguageSelector';
import useRedirectIfNoLanguageCode from '../hooks/useRedirectIfNoLanguageCode';
import TranslationsFormPage from './TranslationsFormPage';
import { getFormTexts, getTextsAndTranslationsForForm, getTextsAndTranslationsHeaders } from './utils';

interface TranslationsByFormPageProps {
  loadForm: any;
  saveTranslation: any;
}

const TranslationsByFormPage = ({ loadForm, saveTranslation }: TranslationsByFormPageProps) => {
  const { formPath, languageCode = '' } = useParams();
  const [form, setForm] = useState<Form>();
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
          formMenu: true,
          formPath: form.path,
        }}
      >
        <TitleRowLayout right={<FormBuilderLanguageSelector languages={languages} formPath={path} />}>
          <Title subTitle={skjemanummer}>{title}</Title>
        </TitleRowLayout>
        <RowLayout
          right={
            <SidebarLayout noScroll={true}>
              <VStack gap="1">
                <ButtonWithSpinner onClick={onSave} size="small">
                  Lagre
                </ButtonWithSpinner>
                <CSVLink
                  data={getTextsAndTranslationsForForm(form, translations)}
                  filename={`${title}(${path})_Oversettelser.csv`}
                  className="navds-button navds-button--tertiary navds-button--small navds-label navds-label--small"
                  separator={';'}
                  headers={getTextsAndTranslationsHeaders(translations)}
                  enclosingCharacter={'"'}
                >
                  Eksporter
                </CSVLink>
                <UserFeedback />
              </VStack>
            </SidebarLayout>
          }
        >
          <TranslationsFormPage
            skjemanummer={skjemanummer}
            translations={translations}
            languageCode={languageCode}
            flattenedComponents={flattenedComponents}
          />
        </RowLayout>
      </AppLayout>
    </>
  );
};

export default TranslationsByFormPage;

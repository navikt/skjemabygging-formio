import { FyllUtRouter, LanguagesProvider, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import {
  formioFormsApiUtils,
  I18nTranslations,
  NavFormType,
  navFormUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import useFormsApiForms from '../../api/useFormsApiForms';
import { loadAllTranslations } from '../../api/useTranslations';
import { NotFoundPage } from '../errors/NotFoundPage';
import SubmissionMethodNotAllowed from '../SubmissionMethodNotAllowed';
import FormPageSkeleton from './FormPageSkeleton';

const FormPageWrapper = () => {
  const { formPath } = useParams();
  const [translations, setTranslations] = useState<I18nTranslations>();
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<NavFormType>();
  const { get } = useFormsApiForms();
  const { submissionMethod } = useAppConfig();

  const loadTranslations = useCallback(async () => {
    if (!formPath) {
      return;
    }

    const translationsData = await loadAllTranslations(formPath);
    if (translationsData) {
      setTranslations(translationsData);
    }
  }, [formPath]);

  const loadForm = useCallback(async () => {
    if (!formPath) {
      return;
    }

    const formData = await get(formPath, 'title,skjemanummer,path,introPage,components,properties,firstPanelSlug');
    if (formData) {
      setForm(formioFormsApiUtils.mapFormToNavForm(formData));
    }
  }, [formPath, get]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadForm(), loadTranslations()]);
      } catch (_e) {
        setTranslations(undefined);
        setForm(undefined);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadForm, loadTranslations]);

  useEffect(() => {
    const metaPropOgTitle = document.querySelector('meta[property="og:title"]');
    const metaNameDescr = document.querySelector('meta[name="description"]');
    const metaNameOgDescr = document.querySelector('meta[property="og:description"]');
    const setHeaderProp = function (headerObj, metaPropValue) {
      headerObj?.setAttribute('content', metaPropValue);
    };

    if (form) {
      if (form.title) {
        document.title = `${form.title} | www.nav.no`;
        setHeaderProp(metaPropOgTitle, `${form.title} | www.nav.no`);
      }
    }

    return function cleanup() {
      document.title = 'Fyll ut skjema - www.nav.no';
      setHeaderProp(metaPropOgTitle, 'Fyll ut skjema - www.nav.no');
      setHeaderProp(metaNameDescr, 'Nav søknadsskjema');
      setHeaderProp(metaNameOgDescr, 'Nav søknadsskjema');
    };
  }, [form]);

  if (loading) {
    return <FormPageSkeleton />;
  }

  if (!translations || !form) {
    return <NotFoundPage />;
  }

  if (submissionMethod && !navFormUtils.isSubmissionMethodAllowed(submissionMethod, form)) {
    return <SubmissionMethodNotAllowed submissionMethod={submissionMethod} />;
  }

  return (
    <LanguagesProvider translations={translations}>
      <FyllUtRouter form={form} />
    </LanguagesProvider>
  );
};

export default FormPageWrapper;

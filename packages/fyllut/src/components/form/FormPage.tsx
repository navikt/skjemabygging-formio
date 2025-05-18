import { FyllUtRouter, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { formioFormsApiUtils, NavFormType, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFormsApiForms from '../../api/useFormsApiForms';
import { ErrorPageWrapper } from '../errors/ErrorPageWrapper';
import SubmissionMethodNotAllowed from '../SubmissionMethodNotAllowed';
import FormPageSkeleton from './FormPageSkeleton';

const FormPage = () => {
  const { formPath } = useParams();
  const [form, setForm] = useState<NavFormType>();
  const { get } = useFormsApiForms();
  const { submissionMethod } = useAppConfig();
  const [loading, setLoading] = useState<boolean>(true);

  const loadForm = useCallback(async () => {
    if (!formPath) {
      return;
    }
    setLoading(true);
    try {
      const formData = await get(formPath);
      if (formData) {
        setForm(formioFormsApiUtils.mapFormToNavForm(formData));
      }
    } finally {
      setLoading(false);
    }
  }, [formPath, get]);

  useEffect(() => {
    (async () => {
      await loadForm();
    })();
  }, [formPath, loadForm]);

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

  if (!form) {
    return <ErrorPageWrapper statusCode={404} />;
  }

  if (submissionMethod && !navFormUtils.isSubmissionMethodAllowed(submissionMethod, form)) {
    return <SubmissionMethodNotAllowed submissionMethod={submissionMethod} />;
  }

  return <FyllUtRouter form={form} />;
};

export default FormPage;

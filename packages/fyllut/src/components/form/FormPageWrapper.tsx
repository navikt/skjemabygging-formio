import { LoadingComponent, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import httpFyllut from '../../util/httpFyllut';
import SubmissionMethodNotAllowed from '../SubmissionMethodNotAllowed';
import { NotFoundPage } from '../errors/NotFoundPage';
import FormPage from './FormPage';

export const FormPageWrapper = () => {
  const { formPath } = useParams();
  const [status, setStatus] = useState('LOADING');
  const [form, setForm] = useState<NavFormType>();
  const { submissionMethod } = useAppConfig();

  useEffect(() => {
    httpFyllut
      .get(`/fyllut/api/forms/${formPath}`)
      .then((form) => {
        setForm(form as NavFormType);
        setStatus('FINISHED LOADING');
      })
      .catch((err) => {
        setStatus(err instanceof httpFyllut.UnauthenticatedError ? 'UNAUTHENTICATED' : 'FORM NOT FOUND');
      });
  }, [formPath]);

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

  if (status === 'LOADING' || status === 'UNAUTHENTICATED') {
    return <LoadingComponent />;
  }

  if (status === 'FORM NOT FOUND' || !form) {
    return <NotFoundPage />;
  }

  if (submissionMethod && !navFormUtils.isSubmissionMethodAllowed(submissionMethod, form)) {
    return <SubmissionMethodNotAllowed submissionMethod={submissionMethod} />;
  }

  return <FormPage form={form} />;
};

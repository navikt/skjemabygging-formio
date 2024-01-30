import { LoadingComponent, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import httpFyllut from '../util/httpFyllut';
import FormPage from './FormPage';
import PageNotFound from './PageNotFound';
import SubmissionMethodNotAllowed from './SubmissionMethodNotAllowed';

export const FormPageWrapper = () => {
  const { formPath } = useParams();
  const [status, setStatus] = useState('LOADING');
  const [form, setForm] = useState<NavFormType>();
  const { submissionMethod, config, http, logger } = useAppConfig();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    httpFyllut
      .get(`/fyllut/api/forms/${formPath}`)
      .then((form) => {
        setForm(form as NavFormType);
        setStatus('FINISHED LOADING');
      })
      .catch((err) => {
        // Temporary workaround. Remove in eight weeks :)
        if (err instanceof http!.HttpError && err.status === 404) {
          const innsendingsId = searchParams.get('innsendingsId');
          if (innsendingsId) {
            http!
              .get<{ visningsType }>(`/fyllut/api/send-inn/soknad/${innsendingsId}`)
              .then((soknad) => {
                if (soknad?.visningsType === 'dokumentinnsending') {
                  const isDevGcp = config?.NAIS_CLUSTER_NAME === 'dev-gcp';
                  const baseUrl = isDevGcp ? 'https://www.intern.dev.nav.no' : 'https://www.nav.no';
                  logger?.info('Redirigerer søknad med visningstype dokumentinnsending', { baseUrl, innsendingsId });
                  window.location.href = `${baseUrl}/sendinn/${innsendingsId}`;
                }
              })
              .catch((err) => {
                logger?.info('Redirigering av søknad med visningstype dokumentinnsending feilet', {
                  innsendingsId,
                  errorMessage: err?.message,
                });
              });
          }
        }
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
      setHeaderProp(metaNameDescr, 'NAV søknadsskjema');
      setHeaderProp(metaNameOgDescr, 'NAV søknadsskjema');
    };
  }, [form]);

  if (status === 'LOADING' || status === 'UNAUTHENTICATED') {
    return <LoadingComponent />;
  }

  if (status === 'FORM NOT FOUND' || !form) {
    return <PageNotFound />;
  }

  if (submissionMethod && !navFormUtils.isSubmissionMethodAllowed(submissionMethod, form)) {
    return <SubmissionMethodNotAllowed submissionMethod={submissionMethod} />;
  }

  return <FormPage form={form} />;
};

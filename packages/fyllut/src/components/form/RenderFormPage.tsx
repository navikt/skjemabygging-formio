import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { reportUnsupportedCustomValidation, RuntimeServices } from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import createIntegrationHttp from '../../adapter-services/createIntegrationHttp';
import createRenderFormBootstrapService from '../../adapter-services/createRenderFormBootstrapService';
import createRuntimeServices from '../../adapter-services/createRuntimeServices';
import { NotFoundPage } from '../errors/NotFoundPage';
import SubmissionMethodNotAllowed from '../SubmissionMethodNotAllowed';
import FormPageSkeleton from './FormPageSkeleton';
import FormPageWrapper from './FormPageWrapper';
import RenderFormAdapter from './RenderFormAdapter';
import useFormDocumentMetadata from './useFormDocumentMetadata';
import useInitializeRenderForm from './useInitializeRenderForm';

const RenderFormPage = () => {
  const { formPath, '*': routePath } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const appConfig = useAppConfig();
  const { submissionMethod, http, baseUrl } = appConfig;
  const backendBaseUrl = baseUrl ?? '/fyllut';
  const innsendingsId = new URLSearchParams(search).get('innsendingsId') ?? undefined;
  const forceMellomlagring = new URLSearchParams(search).get('forceMellomlagring') === 'true';
  const isActiveTasksRoute = routePath === 'paabegynt';
  const loadKey = `${formPath ?? ''}|${submissionMethod ?? ''}|${innsendingsId ?? ''}|${forceMellomlagring}|${isActiveTasksRoute}`;
  const services = useMemo<RuntimeServices>(
    () => createRuntimeServices({ http: createIntegrationHttp(http!), backendBaseUrl, innsendingsId }),
    [backendBaseUrl, http, innsendingsId],
  );
  const bootstrapService = useMemo(
    () => createRenderFormBootstrapService({ http: createIntegrationHttp(http!), backendBaseUrl }),
    [backendBaseUrl, http],
  );
  const { initializedForm, unsupportedCustomValidation, isLoading } = useInitializeRenderForm({
    formPath,
    routePath,
    search,
    submissionMethod,
    bootstrapService,
    applications: services.applications,
    navigate,
    loadKey,
  });

  useFormDocumentMetadata(initializedForm?.form);

  // The feature allowlist is configuration and cannot see the form definition, so a form on the
  // allowlist can still carry a `validate.custom` the new renderer does not reproduce. Ignoring one
  // would accept input production rejects today, so such a form is served by the old renderer
  // instead - always logged to the backend, in every environment.
  useEffect(() => {
    if (unsupportedCustomValidation?.length) {
      reportUnsupportedCustomValidation(appConfig.logger, {
        formPath: formPath ?? '',
        unsupported: unsupportedCustomValidation,
      });
    }
  }, [appConfig.logger, formPath, unsupportedCustomValidation]);

  if (!formPath) {
    return <NotFoundPage />;
  }

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (unsupportedCustomValidation?.length) {
    return <FormPageWrapper />;
  }

  if (!initializedForm) {
    return <NotFoundPage />;
  }

  if (submissionMethod && !navFormUtils.isSubmissionMethodAllowed(submissionMethod, initializedForm.form)) {
    return <SubmissionMethodNotAllowed submissionMethod={submissionMethod} />;
  }

  return (
    <RenderFormAdapter
      form={initializedForm.form}
      translations={initializedForm.translations}
      services={services}
      initialSubmission={initializedForm.initialSubmission}
      initialInnsendingsId={initializedForm.initialInnsendingsId}
      initialLanguage={initializedForm.initialLanguage}
    />
  );
};

export default RenderFormPage;

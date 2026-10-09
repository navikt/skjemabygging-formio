import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { RuntimeServices } from '@navikt/skjemadigitalisering-shared-frontend';
import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import createIntegrationHttp from '../../adapter-services/createIntegrationHttp';
import createRenderFormBootstrapService from '../../adapter-services/createRenderFormBootstrapService';
import createRuntimeServices from '../../adapter-services/createRuntimeServices';
import { InternalServerErrorPage } from '../errors/InternalServerErrorPage';
import { NotFoundPage } from '../errors/NotFoundPage';
import SubmissionMethodNotAllowed from '../SubmissionMethodNotAllowed';
import FormPageSkeleton from './FormPageSkeleton';
import RenderFormAdapter from './RenderFormAdapter';
import resolveSubmissionMethod from './resolveSubmissionMethod';
import useFormDocumentMetadata from './useFormDocumentMetadata';
import useInitializeRenderForm from './useInitializeRenderForm';

const RenderFormPage = () => {
  const { formPath, '*': routePath } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const appConfig = useAppConfig();
  const { http, baseUrl } = appConfig;
  const submissionMethod = resolveSubmissionMethod(search, appConfig.submissionMethod);
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
  const { initializedForm, isLoading, hasInitializationError } = useInitializeRenderForm({
    formPath,
    routePath,
    search,
    submissionMethod,
    bootstrapService,
    applications: services.applications,
    navigate,
    loadKey,
    logger: appConfig.logger,
  });

  useFormDocumentMetadata(initializedForm?.form);

  if (!formPath) {
    return <NotFoundPage />;
  }

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (hasInitializationError) {
    return <InternalServerErrorPage />;
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
      languages={initializedForm.form.languages}
    />
  );
};

export default RenderFormPage;

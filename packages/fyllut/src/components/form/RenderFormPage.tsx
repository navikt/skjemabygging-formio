import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { RuntimeServices } from '@navikt/skjemadigitalisering-shared-frontend';
import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import createRenderFormBootstrapService from '../../adapter-services/createRenderFormBootstrapService';
import createRuntimeServices from '../../adapter-services/createRuntimeServices';
import { NotFoundPage } from '../errors/NotFoundPage';
import SubmissionMethodNotAllowed from '../SubmissionMethodNotAllowed';
import FormPageSkeleton from './FormPageSkeleton';
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
  const services = useMemo<RuntimeServices>(() => {
    if (!http) {
      throw new Error('Fyllut HTTP client is required to render the form.');
    }
    return createRuntimeServices({ http, backendBaseUrl, innsendingsId });
  }, [backendBaseUrl, http, innsendingsId]);
  const bootstrapService = useMemo(() => {
    if (!http) {
      throw new Error('Fyllut HTTP client is required to render the form.');
    }
    return createRenderFormBootstrapService({ http, backendBaseUrl });
  }, [backendBaseUrl, http]);
  const { initializedForm, isLoading } = useInitializeRenderForm({
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

  if (!formPath) {
    return <NotFoundPage />;
  }

  if (isLoading) {
    return <FormPageSkeleton />;
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

import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { useParams } from 'react-router';
import FormPageWrapper from './FormPageWrapper';
import { shouldUseNewRenderer } from './newRendererRouting';
import RenderFormPage from './RenderFormPage';

const FormPage = () => {
  const { formPath, '*': routePath } = useParams();
  const { config, submissionMethod } = useAppConfig();
  const newRenderForms = config?.newRenderForms ?? [];
  const useNewRenderer = shouldUseNewRenderer({ formPath, routePath, newRenderForms });

  if (!useNewRenderer) {
    return <FormPageWrapper />;
  }

  return <RenderFormPage key={`${formPath}|${submissionMethod ?? ''}`} />;
};

export default FormPage;

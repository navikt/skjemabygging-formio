import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { useParams } from 'react-router';
import FormPageWrapper from './FormPageWrapper';
import RenderFormPage from './RenderFormPage';

const FormPage = () => {
  const { formPath, '*': routePath } = useParams();
  const { config, submissionMethod } = useAppConfig();
  const newRenderForms = config?.newRenderForms ?? [];
  const useNewRenderer = !!formPath && (newRenderForms.includes('*') || newRenderForms.includes(formPath));

  if (!useNewRenderer || routePath === 'pdf') {
    return <FormPageWrapper />;
  }

  return <RenderFormPage key={`${formPath}|${submissionMethod ?? ''}`} />;
};

export default FormPage;

import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { applyPrefilledValuesToSubmission, SharedFormRenderer } from '@navikt/skjemadigitalisering-shared-frontend';
import { useLocation } from 'react-router';
import {
  getEffectiveSubmissionMethod,
  getFormRendererRoute,
  getInitialPagesWithErrors,
  getPreservedInitialSubmission,
  requiresSubmissionMethodSelection,
  useAttachmentAdapter,
  useDeletedDraftSummary,
  useFormRendererHost,
  useFormRendererNavigation,
  useNoLoginToken,
  useSubmitters,
} from './host-adapters';

interface RenderFormProps {
  form: Form;
  initialInnsendingsId?: string;
  initialSubmission?: Submission;
}

const RenderForm = ({ form, initialSubmission: initialSubmissionProp, initialInnsendingsId }: RenderFormProps) => {
  const appConfig = useAppConfig();
  const { currentLanguage, translate } = useLanguages();
  const { hash, pathname, search, state } = useLocation();
  const noLoginToken = useNoLoginToken();
  const attachmentAdapter = useAttachmentAdapter(form, noLoginToken.getToken, translate);
  const persistence = useSubmitters(form, initialInnsendingsId, noLoginToken);
  const submissionMethod = getEffectiveSubmissionMethod(form, appConfig.submissionMethod, pathname);
  const route = getFormRendererRoute(form.path, pathname, hash, state);
  const initialPagesWithErrors = getInitialPagesWithErrors(state);
  const initialSubmission = applyPrefilledValuesToSubmission(
    form,
    getPreservedInitialSubmission(state) ?? initialSubmissionProp,
    currentLanguage,
  );
  const { currentDraftId, isDeletedDraftSummary } = useDeletedDraftSummary(search);
  const navigation = useFormRendererNavigation(form.path);
  const host = useFormRendererHost({
    attachmentAdapter,
    currentDraftId,
    form,
    isDeletedDraftSummary,
    onNavigate: navigation,
    noLoginToken,
    submissionMethod,
  });

  return (
    <SharedFormRenderer
      form={form}
      initialSubmission={initialSubmission}
      initialPagesWithErrors={initialPagesWithErrors}
      language={{ translate, currentLanguage }}
      appConfig={{ submissionMethod, logger: appConfig.logger, config: appConfig.config }}
      persistence={persistence}
      route={route}
      host={host}
      mode={requiresSubmissionMethodSelection(form, submissionMethod) ? 'submission-method-selection' : 'wizard'}
    />
  );
};

export default RenderForm;

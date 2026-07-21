import { Provider as AkselProvider } from '@navikt/ds-react';
import { en, nb, nn } from '@navikt/ds-react/locales';
import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, Submission, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import {
  AppConfigProvider,
  applyPrefilledValuesToSubmission,
  FormDefinitionProvider,
  FormHeader,
  FormLayout,
  FormPersistenceProvider,
  LanguageProvider,
  SubmissionStateProvider,
  ValidationProvider,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useLocation } from 'react-router';
import { AttachmentUploadProvider } from './attachment-upload/AttachmentUploadContext';
import FormLanguageSelector from './FormLanguageSelector';
import { NologinTokenProvider } from './nologin-token/NologinTokenContext';
import SubmissionMethodSelection from './SubmissionMethodSelection';
import useSubmitters from './useSubmitters';
import Wizard from './wizard/Wizard';

interface Props {
  form: Form;
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
}

const RenderFormContent = ({
  form,
  initialSubmission,
  initialInnsendingsId,
  initialPagesWithErrors,
  currentLanguage,
}: Props & { initialPagesWithErrors?: string[]; currentLanguage: string }) => {
  const { submissionMethod, logger, config } = useAppConfig();
  const { pathname } = useLocation();
  const persistence = useSubmitters(form, initialInnsendingsId);
  const hydratedInitialSubmission = applyPrefilledValuesToSubmission(form, initialSubmission, currentLanguage);
  const defaultSubmissionMethod = submissionMethod === undefined && pathname !== `/${form.path}` ? 'paper' : undefined;
  const effectiveSubmissionMethod =
    submissionMethod ??
    defaultSubmissionMethod ??
    (submissionTypesUtils.isPaperSubmissionOnly(form.properties.submissionTypes)
      ? 'paper'
      : submissionTypesUtils.isDigitalSubmissionOnly(form.properties.submissionTypes)
        ? 'digital'
        : submissionTypesUtils.isDigitalNoLoginSubmissionOnly(form.properties.submissionTypes)
          ? 'digitalnologin'
          : submissionTypesUtils.isPaperNoCoverPageSubmissionOnly(form.properties.submissionTypes) &&
              (form.properties.submissionTypes?.length ?? 0) > 0
            ? 'papernocoverpage'
            : undefined);
  const shouldRenderWizard =
    effectiveSubmissionMethod !== undefined || (form.properties.submissionTypes?.length ?? 0) === 0;

  return (
    <AppConfigProvider submissionMethod={effectiveSubmissionMethod} logger={logger} config={config}>
      <SubmissionStateProvider initialSubmission={hydratedInitialSubmission}>
        <FormDefinitionProvider form={form}>
          <ValidationProvider initialPagesWithErrors={initialPagesWithErrors}>
            <FormPersistenceProvider saveDraft={persistence.saveDraft} submitForm={persistence.submitForm}>
              <AttachmentUploadProvider>
                <FormLayout>
                  <FormLanguageSelector />
                  {shouldRenderWizard ? (
                    <Wizard form={form} />
                  ) : (
                    <>
                      <FormHeader form={form} />
                      <SubmissionMethodSelection form={form} />
                    </>
                  )}
                </FormLayout>
              </AttachmentUploadProvider>
            </FormPersistenceProvider>
          </ValidationProvider>
        </FormDefinitionProvider>
      </SubmissionStateProvider>
    </AppConfigProvider>
  );
};

const RenderForm = ({ form, initialSubmission: initialSubmissionProp, initialInnsendingsId }: Props) => {
  const { translate, currentLanguage } = useLanguages();
  const { state } = useLocation();
  const initialPagesWithErrors =
    typeof state === 'object' && state && 'validationErrorPages' in state && Array.isArray(state.validationErrorPages)
      ? state.validationErrorPages
      : undefined;
  const initialSubmission =
    typeof state === 'object' && state && 'initialSubmission' in state ? state.initialSubmission : undefined;
  const akselLocale = currentLanguage === 'en' ? en : currentLanguage === 'nn' ? nn : nb;

  return (
    <LanguageProvider translate={translate} currentLanguage={currentLanguage}>
      <AkselProvider locale={akselLocale}>
        <NologinTokenProvider>
          <RenderFormContent
            form={form}
            initialSubmission={initialSubmission ?? initialSubmissionProp}
            initialInnsendingsId={initialInnsendingsId}
            initialPagesWithErrors={initialPagesWithErrors}
            currentLanguage={currentLanguage}
          />
        </NologinTokenProvider>
      </AkselProvider>
    </LanguageProvider>
  );
};

export default RenderForm;

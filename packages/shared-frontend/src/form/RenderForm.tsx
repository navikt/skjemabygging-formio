import { Provider as AkselProvider } from '@navikt/ds-react';
import { en, nb, nn } from '@navikt/ds-react/locales';
import { Form, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router';
import { FyllutAppConfig, FyllutAppConfigProvider, useFyllutAppConfig } from '../context/fyllut/FyllutAppConfigContext';
import { FyllutLanguage, FyllutLanguageProvider } from '../context/fyllut/FyllutLanguageContext';
import { AttachmentUploadProvider } from './attachment-upload/AttachmentUploadContext';
import FormLanguageSelector from './FormLanguageSelector';
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
} from './framework';
import { NologinTokenProvider } from './nologin-token/NologinTokenContext';
import { resolveDefaultSubmissionMethod } from './submissionMethodResolution';
import SubmissionMethodSelection from './SubmissionMethodSelection';
import useSubmitters from './useSubmitters';
import Wizard from './wizard/Wizard';

interface Props {
  form: Form;
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
  fyllutAppConfig: FyllutAppConfig;
  fyllutLanguage: FyllutLanguage;
}

const RenderFormContent = ({
  form,
  initialSubmission,
  initialInnsendingsId,
  initialPagesWithErrors,
  currentLanguage,
}: Omit<Props, 'fyllutAppConfig' | 'fyllutLanguage'> & {
  initialPagesWithErrors?: string[];
  currentLanguage: string;
}) => {
  const { submissionMethod, logger, config } = useFyllutAppConfig();
  const persistence = useSubmitters(form, initialInnsendingsId);
  const hydratedInitialSubmission = applyPrefilledValuesToSubmission(form, initialSubmission, currentLanguage);
  const defaultSubmissionMethod = resolveDefaultSubmissionMethod(form.properties.submissionTypes);
  const effectiveSubmissionMethod = submissionMethod ?? defaultSubmissionMethod;
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

const RenderForm = ({
  form,
  initialSubmission: initialSubmissionProp,
  initialInnsendingsId,
  fyllutAppConfig,
  fyllutLanguage,
}: Props) => {
  const { state } = useLocation();
  const initialPagesWithErrors =
    typeof state === 'object' && state && 'validationErrorPages' in state && Array.isArray(state.validationErrorPages)
      ? state.validationErrorPages
      : undefined;
  const initialSubmission =
    typeof state === 'object' && state && state.preserveInitialSubmission === true && 'initialSubmission' in state
      ? state.initialSubmission
      : undefined;
  const akselLocale = fyllutLanguage.currentLanguage === 'en' ? en : fyllutLanguage.currentLanguage === 'nn' ? nn : nb;

  return (
    <FyllutAppConfigProvider value={fyllutAppConfig}>
      <FyllutLanguageProvider value={fyllutLanguage}>
        <LanguageProvider translate={fyllutLanguage.translate} currentLanguage={fyllutLanguage.currentLanguage}>
          <AkselProvider locale={akselLocale}>
            <NologinTokenProvider>
              <RenderFormContent
                form={form}
                initialSubmission={initialSubmission ?? initialSubmissionProp}
                initialInnsendingsId={initialInnsendingsId}
                initialPagesWithErrors={initialPagesWithErrors}
                currentLanguage={fyllutLanguage.currentLanguage}
              />
            </NologinTokenProvider>
          </AkselProvider>
        </LanguageProvider>
      </FyllutLanguageProvider>
    </FyllutAppConfigProvider>
  );
};

export default RenderForm;
export type { Props as RenderFormProps };

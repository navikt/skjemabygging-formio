import { Provider as AkselProvider } from '@navikt/ds-react';
import { en, nb, nn } from '@navikt/ds-react/locales';
import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import {
  AppConfigProvider,
  FormDefinitionProvider,
  FormHeader,
  FormLayout,
  FormPersistenceProvider,
  LanguageProvider,
  SubmissionStateProvider,
  ValidationProvider,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useLocation } from 'react-router';
import SubmissionMethodSelection from './SubmissionMethodSelection';
import useSubmitters from './useSubmitters';
import Wizard from './wizard/Wizard';

interface Props {
  form: Form;
}

const RenderForm = ({ form }: Props) => {
  const { submissionMethod, logger, config } = useAppConfig();
  const { translate, currentLanguage } = useLanguages();
  const { state } = useLocation();
  const persistence = useSubmitters(form);
  const initialPagesWithErrors =
    typeof state === 'object' && state && 'validationErrorPages' in state && Array.isArray(state.validationErrorPages)
      ? state.validationErrorPages
      : undefined;
  const akselLocale = currentLanguage === 'en' ? en : currentLanguage === 'nn' ? nn : nb;

  return (
    <AppConfigProvider submissionMethod={submissionMethod} logger={logger} config={config}>
      <LanguageProvider translate={translate} currentLanguage={currentLanguage}>
        <AkselProvider locale={akselLocale}>
          <SubmissionStateProvider>
            <FormDefinitionProvider form={form}>
              <ValidationProvider initialPagesWithErrors={initialPagesWithErrors}>
                <FormPersistenceProvider saveDraft={persistence.saveDraft} submitForm={persistence.submitForm}>
                  <FormLayout>
                    {submissionMethod ? (
                      <Wizard form={form} />
                    ) : (
                      <>
                        <FormHeader form={form} />
                        <SubmissionMethodSelection form={form} />
                      </>
                    )}
                  </FormLayout>
                </FormPersistenceProvider>
              </ValidationProvider>
            </FormDefinitionProvider>
          </SubmissionStateProvider>
        </AkselProvider>
      </LanguageProvider>
    </AppConfigProvider>
  );
};

export default RenderForm;

import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Panel, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import {
  FormButtonRow,
  FormErrorSummary,
  FormNextButton,
  FormPrevButton,
  RenderSummaryForm,
  useFormDefinition,
  useFormPersistence,
  useSubmission,
  useValidation,
} from '@navikt/skjemadigitalisering-shared-frontend';

interface Props {
  onBack: () => void;
  onNavigateToError: (pageKey: string, id: string) => void;
}

const Summary = ({ onBack, onNavigateToError }: Props) => {
  const appConfig = useAppConfig();
  const { translate, currentLanguage } = useLanguages();
  const { form, activeComponents, panels } = useFormDefinition();
  const { submission } = useSubmission();
  const { validatePages } = useValidation();
  const { submit, status, canSubmit } = useFormPersistence();

  const handleSubmit = () => {
    const valid = validatePages(
      panels.map((panel: Panel) => ({ pageKey: panel.key, components: panel.components ?? [] })),
    );
    if (valid && canSubmit) {
      void submit();
    }
  };

  return (
    <>
      <RenderSummaryForm
        activeComponents={activeComponents}
        submission={submission}
        form={form}
        currentLanguage={currentLanguage}
        translate={translate}
        appConfig={appConfig}
      />
      <FormErrorSummary
        pages={panels.map((panel: Panel) => ({ pageKey: panel.key, components: panel.components ?? [] }))}
        onNavigateToField={(error, id) => {
          onNavigateToError(error.pageKey, id);
        }}
      />
      <FormButtonRow
        previousButton={<FormPrevButton label={translate(TEXTS.grensesnitt.navigation.previous)} onClick={onBack} />}
        nextButton={
          <FormNextButton label={translate('Send inn')} onClick={handleSubmit} loading={status === 'submitting'} />
        }
      />
    </>
  );
};

export default Summary;

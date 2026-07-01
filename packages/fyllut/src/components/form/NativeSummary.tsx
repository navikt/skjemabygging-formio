import { Button, HStack, Heading, VStack } from '@navikt/ds-react';
import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Panel } from '@navikt/skjemadigitalisering-shared-domain';
import {
  FormErrorSummary,
  RenderSummaryForm,
  useFormDefinition,
  usePersistence,
  useSubmission,
  useValidation,
} from '@navikt/skjemadigitalisering-shared-frontend';

interface Props {
  onBack: () => void;
}

const NativeSummary = ({ onBack }: Props) => {
  const appConfig = useAppConfig();
  const { translate, currentLanguage } = useLanguages();
  const { form, activeComponents, panels } = useFormDefinition();
  const { submission } = useSubmission();
  const { validatePages } = useValidation();
  const { submit, status, canSubmit } = usePersistence();

  const handleSubmit = () => {
    const valid = validatePages(
      panels.map((panel: Panel) => ({ pageKey: panel.key, components: panel.components ?? [] })),
    );
    if (valid && canSubmit) {
      void submit();
    }
  };

  return (
    <VStack gap="space-24" aria-live="polite">
      <Heading size="large">{translate(form.title)}</Heading>
      <RenderSummaryForm
        activeComponents={activeComponents}
        submission={submission}
        form={form}
        currentLanguage={currentLanguage}
        translate={translate}
        appConfig={appConfig}
      />
      <FormErrorSummary />
      <HStack gap="space-16">
        <Button type="button" variant="secondary" onClick={onBack}>
          {translate('Forrige')}
        </Button>
        <Button type="button" onClick={handleSubmit} loading={status === 'submitting'} disabled={!canSubmit}>
          {translate('Send inn')}
        </Button>
      </HStack>
    </VStack>
  );
};

export default NativeSummary;

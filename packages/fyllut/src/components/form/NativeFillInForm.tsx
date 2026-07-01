import { Box } from '@navikt/ds-react';
import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { formioFormsApiUtils, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { FormFrameworkProvider } from '@navikt/skjemadigitalisering-shared-frontend';
import NativeWizard from './NativeWizard';
import useNativeSubmitters from './useNativeSubmitters';

interface Props {
  form: NavFormType;
}

// New, non-Formio fill-in path. Soft-launched per form path via the backend allowlist
// (config.nativeRenderForms). Purely additive: never reached for forms not on the allowlist.
const NativeFillInForm = ({ form }: Props) => {
  const { submissionMethod, logger, config } = useAppConfig();
  const { translate, currentLanguage } = useLanguages();
  const persistence = useNativeSubmitters(form);

  return (
    <FormFrameworkProvider
      form={formioFormsApiUtils.mapNavFormToForm(form)}
      translate={translate}
      currentLanguage={currentLanguage}
      submissionMethod={submissionMethod}
      logger={logger}
      config={config}
      persistence={persistence}
    >
      <Box padding="space-32">
        <NativeWizard title={form.title} />
      </Box>
    </FormFrameworkProvider>
  );
};

export default NativeFillInForm;

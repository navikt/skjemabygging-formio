import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { FormFrameworkProvider, FormLayout } from '@navikt/skjemadigitalisering-shared-frontend';
import Wizard from './Wizard';
import useSubmitters from './useSubmitters';

interface Props {
  form: Form;
}

// New, non-Formio fill-in path. Soft-launched per form path via the backend allowlist
// (config.newRenderForms). Purely additive: never reached for forms not on the allowlist.
const FillInForm = ({ form }: Props) => {
  const { submissionMethod, logger, config } = useAppConfig();
  const { translate, currentLanguage } = useLanguages();
  const persistence = useSubmitters(form);

  return (
    <FormFrameworkProvider
      form={form}
      translate={translate}
      currentLanguage={currentLanguage}
      submissionMethod={submissionMethod}
      logger={logger}
      config={config}
      persistence={persistence}
    >
      <FormLayout>
        <Wizard form={form} />
      </FormLayout>
    </FormFrameworkProvider>
  );
};

export default FillInForm;

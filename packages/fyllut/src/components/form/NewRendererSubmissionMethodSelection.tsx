import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { FormFrameworkProvider, FormHeader, FormLayout } from '@navikt/skjemadigitalisering-shared-frontend';
import SubmissionMethodSelection from './SubmissionMethodSelection';

interface Props {
  form: Form;
}

const NewRendererSubmissionMethodSelection = ({ form }: Props) => {
  const { logger, config } = useAppConfig();
  const { translate, currentLanguage } = useLanguages();

  return (
    <FormFrameworkProvider
      form={form}
      translate={translate}
      currentLanguage={currentLanguage}
      logger={logger}
      config={config}
    >
      <FormLayout>
        <FormHeader form={form} />
        <SubmissionMethodSelection form={form} />
      </FormLayout>
    </FormFrameworkProvider>
  );
};

export default NewRendererSubmissionMethodSelection;

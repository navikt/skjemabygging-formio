import { FormSummary } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryCheckbox = ({ component, submissionPath }: FormComponentProps) => {
  const { translate } = useLanguages();
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  // Do not show anything if the checkbox is not checked
  if (!value) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel component={component} />
      <FormSummary.Value>{value ? translate(TEXTS.common.yes) : translate(TEXTS.common.no)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryCheckbox;

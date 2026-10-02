import { PdfData, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../types';

const DefaultSelectAnswer = (props: PdfComponentProps): PdfData | null => {
  const { component, submissionPath, submission, translate } = props;
  const { label } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);
  const optionValues = component.data?.values ?? component.values ?? [];

  if (value && typeof value === 'object' && 'label' in value && typeof value.label === 'string') {
    return {
      label: translate(label),
      verdi: translate(value.label),
    };
  }

  if (typeof value !== 'string') {
    return null;
  }

  const option = optionValues.find((dataValue) => dataValue.value === value);

  return {
    label: translate(label),
    verdi: option?.label ? translate(option.label) : translate(value),
  };
};

export default DefaultSelectAnswer;

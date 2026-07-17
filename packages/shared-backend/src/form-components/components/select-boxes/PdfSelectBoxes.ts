import { submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../types';

const isSelected = (value: unknown, optionValue: string) => {
  if (Array.isArray(value)) {
    return value.includes(optionValue);
  }

  if (value && typeof value === 'object') {
    return value[optionValue] === true;
  }

  return false;
};

const PdfSelectBoxes = (props: PdfComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { values, label } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !values || values.length === 0) {
    return null;
  }

  const valueObjects = values
    .filter((checkbox) => isSelected(value, checkbox.value))
    .map((checkbox) => translate(checkbox.label));

  if (!valueObjects || valueObjects.length === 0) {
    return null;
  }

  return {
    label: translate(label),
    verdiliste: valueObjects.map((boxValue) => {
      return { label: boxValue };
    }),
    visningsVariant: 'PUNKTLISTE',
  };
};

export default PdfSelectBoxes;

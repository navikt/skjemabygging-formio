import { formatUtils, PdfData, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../types';

const findNestedValueByKey = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findNestedValueByKey(item, key);
      if (nested !== undefined) {
        return nested;
      }
    }

    return undefined;
  }

  if (key in value) {
    const direct = value[key as keyof typeof value];
    if (direct !== '' && direct !== undefined) {
      return direct;
    }
  }

  for (const nestedValue of Object.values(value)) {
    const nested = findNestedValueByKey(nestedValue, key);
    if (nested !== undefined) {
      return nested;
    }
  }

  return undefined;
};

const PdfAccountNumber = (props: PdfComponentProps): PdfData | null => {
  const { component, submissionPath, submission, translate } = props;
  const directValue = submissionUtils.getPdfSubmissionValue(submissionPath, submission);
  const fallbackValue =
    directValue ?? (component.key ? findNestedValueByKey(submission?.data, component.key) : undefined);
  const value = typeof fallbackValue === 'string' || typeof fallbackValue === 'number' ? `${fallbackValue}` : undefined;

  if (value === undefined) {
    return null;
  }

  return {
    label: translate(component.label),
    verdi: formatUtils.formatAccountNumber(value),
  };
};

export default PdfAccountNumber;

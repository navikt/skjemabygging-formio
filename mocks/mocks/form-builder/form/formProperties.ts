import { generateId } from '../shared/utils';

export interface FormSignatureType {
  label: string;
  description?: string;
}

/**
 * Copy from shared-domain since mock cant use shared-domain
 */
type SubmissionType = 'PAPER' | 'DIGITAL' | 'DIGITAL_NO_LOGIN' | 'STATIC_PDF';

export interface FormPropertiesType {
  formNumber: string;
  subjectOfSubmission?: string;
  submissionTypes?: SubmissionType[];
  subsequentSubmissionTypes?: SubmissionType[];
  mellomlagringDurationDays?: string;
  signatures?: {
    values: FormSignatureType[];
    oldSyntax?: boolean;
  };
}

const formProperties = (props: FormPropertiesType) => {
  const {
    formNumber,
    subjectOfSubmission,
    submissionTypes,
    subsequentSubmissionTypes,
    mellomlagringDurationDays,
    signatures,
  } = props ?? {};

  const getSignatures = () => {
    if (signatures?.oldSyntax) {
      return {
        signature1: signatures.values?.[0]?.label ?? '',
        signature2: signatures.values?.[1]?.label ?? '',
        signature3: signatures.values?.[2]?.label ?? '',
        signature4: signatures.values?.[3]?.label ?? '',
        signature5: signatures.values?.[4]?.label ?? '',
      };
    }

    if (!signatures?.values) {
      return [];
    }

    return signatures?.values.map((item) => ({
      key: generateId(),
      label: item.label,
      description: item.description ?? '',
    }));
  };

  return {
    ...staticDefaultValues,
    tema: subjectOfSubmission ?? 'HJE',
    skjemanummer: formNumber,
    submissionTypes: submissionTypes ?? ['PAPER', 'DIGITAL', 'DIGITAL_NO_LOGIN'],
    subsequentSubmissionTypes: subsequentSubmissionTypes ?? ['PAPER', 'DIGITAL'],
    mellomlagringDurationDays: mellomlagringDurationDays ?? '28',
    signatures: getSignatures(),
  };
};

const staticDefaultValues = {
  modified: '2025-01-01T00:00:00.000Z',
  published: '2025-01-01T00:00:00.000Z',
  modifiedBy: 'Ola Nordmann',
  publishedBy: 'Ola Nordmann',
};

export default formProperties;

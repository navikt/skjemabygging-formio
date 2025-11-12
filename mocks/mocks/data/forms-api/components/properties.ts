interface PropertiesType {
  formNumber: string;
  subjectOfSubmission?: string;
  submissionTypes?: string[];
  subsequentSubmissionTypes?: string[];
  mellomlagringDurationDays?: string;
}

const properties = ({
  formNumber,
  subjectOfSubmission,
  submissionTypes,
  subsequentSubmissionTypes,
  mellomlagringDurationDays,
}: PropertiesType) => {
  return {
    tema: subjectOfSubmission ?? 'HJE',
    modified: '2025-01-01T00:00:00.000Z',
    published: '2025-01-01T00:00:00.000Z',
    modifiedBy: 'Ola Nordmann',
    publishedBy: 'Ola Nordmann',
    skjemanummer: formNumber,
    submissionTypes: submissionTypes ?? ['PAPER', 'DIGITAL', 'DIGITAL_NO_LOGIN'],
    subsequentSubmissionTypes: subsequentSubmissionTypes ?? ['PAPER', 'DIGITAL'],
    mellomlagringDurationDays: mellomlagringDurationDays ?? '28',
  };
};

export default properties;
export type { PropertiesType };

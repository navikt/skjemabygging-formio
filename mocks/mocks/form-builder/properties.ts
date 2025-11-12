export interface PropertiesType {
  formNumber: string;
  subjectOfSubmission?: string;
  submissionTypes?: string[];
  subsequentSubmissionTypes?: string[];
  mellomlagringDurationDays?: string;
}

const properties = (params: PropertiesType) => {
  const { formNumber, subjectOfSubmission, submissionTypes, subsequentSubmissionTypes, mellomlagringDurationDays } =
    params ?? {};

  return {
    ...staticDefaultValues,
    tema: subjectOfSubmission ?? 'HJE',
    skjemanummer: formNumber,
    submissionTypes: submissionTypes ?? ['PAPER', 'DIGITAL', 'DIGITAL_NO_LOGIN'],
    subsequentSubmissionTypes: subsequentSubmissionTypes ?? ['PAPER', 'DIGITAL'],
    mellomlagringDurationDays: mellomlagringDurationDays ?? '28',
  };
};

const staticDefaultValues = {
  modified: '2025-01-01T00:00:00.000Z',
  published: '2025-01-01T00:00:00.000Z',
  modifiedBy: 'Ola Nordmann',
  publishedBy: 'Ola Nordmann',
};

export default properties;

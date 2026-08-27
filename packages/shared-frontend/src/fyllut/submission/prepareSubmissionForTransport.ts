import { Submission } from '@navikt/skjemadigitalisering-shared-domain';

const removeEmptyStructures = (_key: string, value: unknown) => {
  if (value && typeof value === 'object' && Object.keys(value).length === 0) {
    return undefined;
  }
  return value;
};

const prepareSubmissionForTransport = (submission: Submission): Submission => {
  if (!submission.data || Object.keys(submission.data).length === 0) {
    return { data: {} };
  }

  const { data, fyllutState: _fyllutState, ...rest } = submission;
  const sanitizedData = JSON.parse(JSON.stringify(data, removeEmptyStructures)) as Submission['data'];

  return { data: sanitizedData ?? {}, ...rest };
};

export default prepareSubmissionForTransport;

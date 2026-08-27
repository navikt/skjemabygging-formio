import { Submission } from '@navikt/skjemadigitalisering-shared-domain';

const removeEmptyStructures = (_key: string, value: unknown) => {
  if (value && typeof value === 'object' && Object.keys(value).length === 0) {
    return undefined;
  }
  return value;
};

const prepareSubmissionForTransport = (submission: Submission): Submission => {
  const { data = {}, fyllutState: _fyllutState, ...rest } = submission;
  const sanitizedData =
    Object.keys(data).length > 0 ? (JSON.parse(JSON.stringify(data, removeEmptyStructures)) as Submission['data']) : {};

  return { data: sanitizedData ?? {}, ...rest };
};

export default prepareSubmissionForTransport;

import { Submission } from '@navikt/skjemadigitalisering-shared-domain';

// A function, not an arrow, because JSON.stringify passes the object or array holding the value as
// `this`. An empty row stays {}: removing an array item makes JSON.stringify write null instead.
function removeEmptyStructures(this: unknown, _key: string, value: unknown) {
  if (!Array.isArray(this) && value && typeof value === 'object' && Object.keys(value).length === 0) {
    return undefined;
  }
  return value;
}

const prepareSubmissionForTransport = (submission: Submission): Submission => {
  const { data = {}, fyllutState: _fyllutState, ...rest } = submission;
  const sanitizedData =
    Object.keys(data).length > 0 ? (JSON.parse(JSON.stringify(data, removeEmptyStructures)) as Submission['data']) : {};

  return { data: sanitizedData ?? {}, ...rest };
};

export default prepareSubmissionForTransport;

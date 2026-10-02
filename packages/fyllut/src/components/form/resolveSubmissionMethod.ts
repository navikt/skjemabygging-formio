import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';

// The 'sub' query param can change via client-side navigation (e.g. selecting a submission method
// on the intro page), so it must be re-read from the reactive location search string on every
// render instead of relying solely on the app config value, which is only resolved once at
// initial page load.
const resolveSubmissionMethod = (search: string, fallback?: SubmissionMethod): SubmissionMethod | undefined =>
  (new URLSearchParams(search).get('sub') as SubmissionMethod | null) ?? fallback;

export default resolveSubmissionMethod;

import { validate as isUuid } from 'uuid';
import { validatorUtils } from '../form/validatorUtils';

const NOT_FOUND_PATH = '/404';

type SendinnEntry =
  | { journey: 'standalone' }
  | { journey: 'form'; formPath: string }
  | { journey: 'formWithTask'; formPath: string; submissionId: string }
  | { journey: 'task'; submissionId: string }
  | { journey: 'unavailable' };

const unavailable: SendinnEntry = { journey: 'unavailable' };

/**
 * Returns innsendingsId when it occurs exactly once and is a UUID, otherwise undefined.
 */
const getValidSubmissionId = (searchParams: URLSearchParams): string | undefined => {
  const values = searchParams.getAll('innsendingsId');
  if (values.length !== 1 || !isUuid(values[0])) {
    return undefined;
  }
  return values[0];
};

const resolveTask = (searchParams: URLSearchParams): SendinnEntry => {
  const submissionId = getValidSubmissionId(searchParams);
  if (!submissionId) {
    return unavailable;
  }
  return { journey: 'task', submissionId };
};

const resolveForm = (formPath: string, searchParams: URLSearchParams): SendinnEntry => {
  if (!validatorUtils.isValidFormPath(formPath)) {
    return unavailable;
  }

  if (!searchParams.has('innsendingsId')) {
    return { journey: 'form', formPath };
  }

  const submissionId = getValidSubmissionId(searchParams);
  if (!submissionId) {
    return unavailable;
  }
  return { journey: 'formWithTask', formPath, submissionId };
};

/**
 * Resolves a sendinn entry URL to a journey.
 *
 * @param path the path relative to the app base path, for example `/nav123456` for `/sendinn/nav123456`
 * @param searchParams the query parameters of the URL
 */
const resolveEntry = (path: string, searchParams: URLSearchParams): SendinnEntry => {
  const segments = path.split('/').filter(Boolean);
  if (segments.length !== 1) {
    return unavailable;
  }

  const [segment] = segments;
  switch (segment) {
    case 'lospost':
      // The standalone journey (løspost) does not use innsendingsId, so the query is ignored.
      return { journey: 'standalone' };
    case 'oppgave':
      return resolveTask(searchParams);
    case '404':
      // The app's own not found page. Without this case, 404 would pass as a form path.
      return unavailable;
    default:
      return resolveForm(segment, searchParams);
  }
};

/**
 * Path to the not found page, relative to the app base path. Keeps only the language parameter.
 */
const createNotFoundPath = (searchParams: URLSearchParams): string => {
  const language = searchParams.get('lang');
  if (!language) {
    return NOT_FOUND_PATH;
  }
  return `${NOT_FOUND_PATH}?${new URLSearchParams({ lang: language })}`;
};

const requiresLogin = (entry: SendinnEntry): boolean => entry.journey === 'formWithTask' || entry.journey === 'task';

const sendinnEntryUtils = {
  createNotFoundPath,
  resolveEntry,
  requiresLogin,
};

export { sendinnEntryUtils };
export type { SendinnEntry };

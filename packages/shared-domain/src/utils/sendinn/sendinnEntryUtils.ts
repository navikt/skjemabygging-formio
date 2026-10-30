import { validatorUtils } from '../form/validatorUtils';
import { submissionUtils } from '../submission/submissionUtils';

const BASE_PATH = '/sendinn';
const LOGIN_PATH = `${BASE_PATH}/oauth2/login`;
const NOT_FOUND_PATH = '/404';
const FORM_STEPS = new Set(['sendinnCollection', 'sendinnAttachments', 'oppsummering', 'instructions']);

type SendinnEntry =
  | { journey: 'standalone' }
  | { journey: 'form'; formPath: string }
  | { journey: 'formWithTask'; formPath: string; submissionId: string }
  | { journey: 'task'; submissionId: string }
  | { journey: 'taskLink'; submissionId: string }
  | { journey: 'unavailable' };

const unavailable: SendinnEntry = { journey: 'unavailable' };

const resolveTask = (searchParams: URLSearchParams): SendinnEntry => {
  const submissionId = submissionUtils.getValidSubmissionId(searchParams);
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

  const submissionId = submissionUtils.getValidSubmissionId(searchParams);
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
  const segments = path.replace(/\/$/, '').split('/').slice(1);
  if (segments.length === 2 && FORM_STEPS.has(segments[1])) {
    const entry = resolveEntry(`/${segments[0]}`, searchParams);
    return entry.journey === 'form' ? entry : unavailable;
  }
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
      if (validatorUtils.isValidUuid(segment)) {
        // Task link from a notification. A later slice looks up the task to choose the journey.
        return { journey: 'taskLink', submissionId: segment };
      }
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

const requiresLogin = (entry: SendinnEntry): boolean =>
  entry.journey === 'formWithTask' || entry.journey === 'task' || entry.journey === 'taskLink';

const isSendinnPath = (path: string) =>
  (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`) || path.startsWith(`${BASE_PATH}?`)) && !path.includes('\\');

/**
 * Wonderwall sign-in URL that returns to the given path. The return path must stay under the sendinn base path,
 * otherwise the user returns to the base path.
 *
 * @param returnPath absolute path including query, for example `/sendinn/oppgave?innsendingsId=...`
 */
const createLoginUrl = (returnPath: string): string =>
  `${LOGIN_PATH}?redirect=${encodeURIComponent(isSendinnPath(returnPath) ? returnPath : BASE_PATH)}`;

const sendinnEntryUtils = {
  basePath: BASE_PATH,
  createLoginUrl,
  createNotFoundPath,
  resolveEntry,
  requiresLogin,
};

export { sendinnEntryUtils };
export type { SendinnEntry };

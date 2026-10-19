import { validate as isUuid } from 'uuid';
import { validatorUtils } from '../form/validatorUtils';

const STANDALONE_SEGMENT = 'lospost';
const TASK_SEGMENT = 'oppgave';
const NOT_FOUND_SEGMENT = '404';
const NOT_FOUND_PATH = `/${NOT_FOUND_SEGMENT}`;
const SUBMISSION_ID_PARAM = 'innsendingsId';
const LANGUAGE_PARAM = 'lang';

type SendinnEntry =
  | { journey: 'lospost' }
  | { journey: 'form'; formPath: string }
  | { journey: 'formWithTask'; formPath: string; submissionId: string }
  | { journey: 'task'; submissionId: string }
  | { journey: 'unavailable' };

type SendinnJourney = SendinnEntry['journey'];

const unavailable: SendinnEntry = { journey: 'unavailable' };

// Returns undefined when the parameter is missing, null when it is present but invalid.
const getSubmissionId = (searchParams: URLSearchParams): string | undefined | null => {
  const values = searchParams.getAll(SUBMISSION_ID_PARAM);
  if (values.length === 0) {
    return undefined;
  }
  if (values.length > 1 || !isUuid(values[0])) {
    return null;
  }
  return values[0];
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
  if (segment === NOT_FOUND_SEGMENT) {
    return unavailable;
  }

  if (segment === STANDALONE_SEGMENT) {
    return { journey: 'lospost' };
  }

  const submissionId = getSubmissionId(searchParams);
  if (submissionId === null) {
    return unavailable;
  }

  if (segment === TASK_SEGMENT) {
    return submissionId ? { journey: 'task', submissionId } : unavailable;
  }

  if (!validatorUtils.isValidFormPath(segment)) {
    return unavailable;
  }

  return submissionId
    ? { journey: 'formWithTask', formPath: segment, submissionId }
    : { journey: 'form', formPath: segment };
};

/**
 * Path to the not found page, relative to the app base path. Keeps only the language parameter.
 */
const createNotFoundPath = (searchParams: URLSearchParams): string => {
  const language = searchParams.get(LANGUAGE_PARAM);
  return language ? `${NOT_FOUND_PATH}?${new URLSearchParams({ [LANGUAGE_PARAM]: language })}` : NOT_FOUND_PATH;
};

const requiresLogin = (entry: SendinnEntry): boolean => entry.journey === 'formWithTask' || entry.journey === 'task';

const sendinnEntryUtils = {
  notFoundPath: NOT_FOUND_PATH,
  createNotFoundPath,
  resolveEntry,
  requiresLogin,
};

export { sendinnEntryUtils };
export type { SendinnEntry, SendinnJourney };

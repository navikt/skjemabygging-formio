import { HttpResponseError } from '@navikt/skjemadigitalisering-shared-domain';

/**
 * Bounded classification of a failed call to another service. Alert rules group on these fields,
 * so never put request-specific values such as IDs, paths or messages in them.
 */
type DependencyErrorType = 'NETWORK_ERROR' | 'TIMEOUT' | 'ERROR_RESPONSE';

interface DependencyErrorFields {
  errorType: DependencyErrorType;
  dependency: string;
}

const dependencyErrorTypes: DependencyErrorType[] = ['NETWORK_ERROR', 'TIMEOUT', 'ERROR_RESPONSE'];

const isTimeout = (error: any) => error?.name === 'TimeoutError' || error?.code === 'ERR_JWKS_TIMEOUT';

const isNetworkError = (error: any) => error instanceof TypeError && error.message === 'fetch failed';

const isErrorResponse = (error: any) => error instanceof HttpResponseError || typeof error?.http_status === 'number';

const classifyDependencyError = (error: unknown): DependencyErrorType | undefined => {
  if (isTimeout(error)) return 'TIMEOUT';
  if (isNetworkError(error)) return 'NETWORK_ERROR';
  if (isErrorResponse(error)) return 'ERROR_RESPONSE';
  return undefined;
};

const getDependencyName = (url: string | URL | undefined): string | undefined => {
  if (!url) return undefined;
  try {
    return new URL(url).hostname || undefined;
  } catch {
    return undefined;
  }
};

const getDependencyErrorFields = (error: unknown): Partial<DependencyErrorFields> => {
  const { errorType, dependency } = (error ?? {}) as Partial<Record<keyof DependencyErrorFields, unknown>>;
  if (typeof dependency !== 'string' || !dependencyErrorTypes.includes(errorType as DependencyErrorType)) {
    return {};
  }

  return { errorType: errorType as DependencyErrorType, dependency };
};

/**
 * Marks an error from a call to another service with errorType and dependency (the host name).
 * Leaves errors it cannot classify, such as bugs in our own code, unmarked.
 * Keeps existing fields, so the call closest to the failing service decides.
 */
const markDependencyError = <T>(error: T, url: string | URL | undefined): T => {
  const dependency = getDependencyName(url);
  const errorType = classifyDependencyError(error);
  if (
    !dependency ||
    !errorType ||
    typeof error !== 'object' ||
    error === null ||
    getDependencyErrorFields(error).dependency
  ) {
    return error;
  }

  return Object.assign(error, { errorType, dependency });
};

const copyDependencyErrorFields = <T extends object>(from: unknown, to: T): T =>
  Object.assign(to, getDependencyErrorFields(from));

const fetchFromDependency = async (url: string | URL, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, init);
  } catch (error) {
    throw markDependencyError(error, url);
  }
};

export { copyDependencyErrorFields, fetchFromDependency, getDependencyErrorFields, markDependencyError };
export type { DependencyErrorFields, DependencyErrorType };

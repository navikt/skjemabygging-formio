import { HttpResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { getErrorDependency, getHostname } from '../../shared/http/errorDependency';

type DependencyErrorType = 'NETWORK_ERROR' | 'TIMEOUT' | 'ERROR_RESPONSE';

type DependencyErrorLogFields = {
  errorType?: DependencyErrorType;
  dependency?: string;
  causeCode?: string;
};

const MAX_CAUSE_DEPTH = 10;

const TIMEOUT_CODES = new Set([
  'ETIMEDOUT',
  'ESOCKETTIMEDOUT',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
  'ERR_JWKS_TIMEOUT',
]);

const TIMEOUT_NAMES = new Set(['TimeoutError', 'JWKSTimeout']);

const NETWORK_CODES = new Set([
  'EAI_AGAIN',
  'ENOTFOUND',
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EPIPE',
  'UND_ERR_SOCKET',
  'UND_ERR_CONNECT',
  'UND_ERR_CLOSED',
  'UND_ERR_DESTROYED',
]);

const getNonEmptyString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const collectErrorChain = (root: unknown): Record<string, unknown>[] => {
  const chain: Record<string, unknown>[] = [];
  const visited = new Set<unknown>();
  const queue: unknown[] = [root];

  while (queue.length > 0 && chain.length < MAX_CAUSE_DEPTH) {
    const current = queue.shift();
    if (typeof current !== 'object' || current === null || visited.has(current)) {
      continue;
    }

    visited.add(current);
    const record = current as Record<string, unknown>;
    chain.push(record);

    if ('cause' in record && record.cause !== undefined) {
      queue.push(record.cause);
    }

    if (current instanceof AggregateError && current.errors.length > 0) {
      queue.push(current.errors[0]);
    }
  }

  return chain;
};

const isLegacyHttpError = (node: Record<string, unknown>): boolean =>
  typeof node.http_status === 'number' || getNonEmptyString(node.http_url) !== undefined;

const isFetchFailedError = (node: Record<string, unknown>): boolean =>
  node instanceof TypeError && node.message === 'fetch failed';

const getDependencyFromNode = (node: Record<string, unknown>, code: string | undefined): string | undefined =>
  getErrorDependency(node) ??
  getHostname(getNonEmptyString(node.http_url)) ??
  (code && (NETWORK_CODES.has(code) || TIMEOUT_CODES.has(code)) ? getNonEmptyString(node.hostname) : undefined);

const getDependencyErrorLogFields = (error: unknown): DependencyErrorLogFields => {
  const chain = collectErrorChain(error);

  let dependency: string | undefined;
  let isTimeout = false;
  let isErrorResponse = false;
  let isNetworkError = false;
  let isAbortError = false;
  let timeoutCode: string | undefined;
  let networkCode: string | undefined;
  let fallbackCode: string | undefined;

  for (const node of chain) {
    const code = getNonEmptyString(node.code);
    const name = getNonEmptyString(node.name);
    dependency ??= getDependencyFromNode(node, code);

    if (code && TIMEOUT_CODES.has(code)) {
      isTimeout = true;
      timeoutCode ??= code;
    } else if (name && TIMEOUT_NAMES.has(name)) {
      isTimeout = true;
      timeoutCode ??= code ?? name;
    }

    if (node instanceof HttpResponseError || isLegacyHttpError(node)) {
      isErrorResponse = true;
    }

    if (name === 'AbortError') {
      isAbortError = true;
    }

    if (code && NETWORK_CODES.has(code)) {
      isNetworkError = true;
      networkCode ??= code;
    } else if (isFetchFailedError(node)) {
      isNetworkError = true;
    } else if (
      getErrorDependency(node) !== undefined &&
      !(node instanceof HttpResponseError) &&
      name !== 'AbortError'
    ) {
      isNetworkError = true;
    }

    if (code && !fallbackCode) {
      fallbackCode = code;
    }
  }

  let errorType: DependencyErrorType | undefined;
  let causeCode: string | undefined;

  if (isTimeout) {
    errorType = 'TIMEOUT';
    causeCode = timeoutCode;
  } else if (isErrorResponse) {
    errorType = 'ERROR_RESPONSE';
  } else if (isAbortError) {
    return {};
  } else if (isNetworkError) {
    errorType = 'NETWORK_ERROR';
    causeCode = networkCode ?? fallbackCode;
  } else {
    return {};
  }

  return {
    errorType,
    ...(dependency && { dependency }),
    ...(causeCode && { causeCode }),
  };
};

export { getDependencyErrorLogFields };
export type { DependencyErrorLogFields, DependencyErrorType };

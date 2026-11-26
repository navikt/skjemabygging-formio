export { HttpResponseError } from '@navikt/skjemadigitalisering-shared-domain';
export {
  copyDependencyErrorFields,
  fetchFromDependency,
  getDependencyErrorFields,
  markDependencyError,
} from './http/dependencyError';
export type { DependencyErrorFields, DependencyErrorType } from './http/dependencyError';
export { isAuthenticationError } from './http/http';
export { createTeamLogger } from './logger/teamLogger';
export type { LogMetadata, TeamLogger, TeamLoggerConfig } from './logger/teamLogger';
export type { Logger } from './logger/types';

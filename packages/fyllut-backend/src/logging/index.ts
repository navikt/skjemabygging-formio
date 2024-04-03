import { loggingUtils, LogLevel } from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../config/config';

const { backendLogLevel } = config;

export const isEnabled = loggingUtils.logLevelIsEnabled(backendLogLevel as LogLevel);

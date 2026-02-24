import { LogLevel } from '../../models';

const LogLevelRank: Record<LogLevel, number> = {
  trace: 1,
  debug: 2,
  info: 3,
  warning: 4,
  error: 5,
};

const logLevelIsEnabled = (configLevel: LogLevel) => (level: LogLevel) =>
  LogLevelRank[level] >= LogLevelRank[configLevel];

const loggingUtils = {
  logLevelIsEnabled,
};

export { loggingUtils };

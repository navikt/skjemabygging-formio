import { LogLevel } from './types';

const LogLevelRank: Record<LogLevel, number> = {
  trace: 1,
  debug: 2,
  info: 3,
  warning: 4,
  error: 5,
};

export const logLevelIsEnabled = (configLevel: LogLevel) => (level: LogLevel) =>
  LogLevelRank[level] >= LogLevelRank[configLevel];

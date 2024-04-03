export type FrontendLoggerConfigType = {
  enabled: boolean;
  browserOnly: boolean;
  logLevel: LogLevel;
};

export type LogLevel = 'trace' | 'debug' | 'info' | 'warning' | 'error';

export type FrontendLoggerConfigType = {
  enabled: boolean;
  browserOnly: boolean;
  logLevel: LogLevel;
  filterTags: LogTag[];
};

export type LogTag = 'component' | 'focus' | 'error';

export type LogContext = { tags?: LogTag[] } & Record<string, any>;

export type LogLevel = 'trace' | 'debug' | 'info' | 'warning' | 'error';

import { LogContext, LogTag } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../../context/config/configContext';

type LoggerFunction = (message: string, context: LogContext) => void;
export type ComponentLogger = {
  trace: LoggerFunction;
  debug: LoggerFunction;
  info: LoggerFunction;
  error: LoggerFunction;
};

export const createComponentLogger = (
  appConfig: AppConfigContextType | undefined,
  options: {
    messagePrefix: string;
    defaultTags: LogTag[];
  },
): ComponentLogger => {
  const appConfigLogger = appConfig?.logger;
  const { messagePrefix = '', defaultTags = [] } = options;
  return {
    trace: (message, context: LogContext) =>
      appConfigLogger?.trace(`${messagePrefix}${message}`, appendTags(context, defaultTags)),
    debug: (message, context: LogContext) =>
      appConfigLogger?.debug(`${messagePrefix}${message}`, appendTags(context, defaultTags)),
    info: (message, context: LogContext) =>
      appConfigLogger?.info(`${messagePrefix}${message}`, appendTags(context, defaultTags)),
    error: (message, context: LogContext) =>
      appConfigLogger?.error(`${messagePrefix}${message}`, appendTags(context, defaultTags)),
  };
};

const appendTags = (context: any, defaultTags: any) => {
  return {
    ...context,
    tags: [...(context.tags || []), ...defaultTags],
  };
};

import { AppConfigContextType } from '../../../context/config/configContext';

type LoggerFunction = (message: string, context: object) => void;
export type ComponentLogger = {
  trace: LoggerFunction;
  debug: LoggerFunction;
  info: LoggerFunction;
  error: LoggerFunction;
};
const createComponentLogger = (
  appConfig: AppConfigContextType | undefined,
  messagePrefix: string = '',
): ComponentLogger => {
  const appConfigLogger = appConfig?.logger;
  return {
    trace: (message, context) => appConfigLogger?.trace(`${messagePrefix}${message}`, context),
    debug: (message, context) => appConfigLogger?.debug(`${messagePrefix}${message}`, context),
    info: (message, context) => appConfigLogger?.info(`${messagePrefix}${message}`, context),
    error: (message, context) => appConfigLogger?.error(`${messagePrefix}${message}`, context),
  };
};
export default createComponentLogger;

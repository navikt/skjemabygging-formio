import { ApplicationLogger } from '../context/application/ApplicationContext';

type RendererSurface = 'input' | 'summary';

interface UnsupportedComponentContext {
  componentType: string;
  formPath: string;
  surface: RendererSurface;
}

const reportedComponentsByLogger = new WeakMap<ApplicationLogger, Set<string>>();

const reportUnsupportedComponent = (
  logger: ApplicationLogger | undefined,
  { componentType, formPath, surface }: UnsupportedComponentContext,
) => {
  if (!logger?.error) {
    return;
  }

  const reportKey = `${formPath}\0${surface}\0${componentType}`;
  const reportedComponents = reportedComponentsByLogger.get(logger) ?? new Set<string>();
  if (reportedComponents.has(reportKey)) {
    return;
  }

  reportedComponents.add(reportKey);
  reportedComponentsByLogger.set(logger, reportedComponents);
  logger.error('Unsupported component in renderer', { componentType, formPath, surface });
};

export { reportUnsupportedComponent };
export type { RendererSurface, UnsupportedComponentContext };

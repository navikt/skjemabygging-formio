import { ApplicationLogger } from '../context/application/ApplicationContext';

type RendererSurface = 'input' | 'summary';

interface UnsupportedComponentContext {
  componentType: string;
  formPath: string;
  surface: RendererSurface;
}

const reportedComponentsByLogger = new WeakMap<ApplicationLogger, Set<string>>();

const reportOnce = (logger: ApplicationLogger, reportKey: string, report: () => void) => {
  const reportedComponents = reportedComponentsByLogger.get(logger) ?? new Set<string>();
  if (reportedComponents.has(reportKey)) {
    return;
  }

  reportedComponents.add(reportKey);
  reportedComponentsByLogger.set(logger, reportedComponents);
  report();
};

const reportUnsupportedComponent = (
  logger: ApplicationLogger | undefined,
  { componentType, formPath, surface }: UnsupportedComponentContext,
) => {
  if (!logger?.error) {
    return;
  }

  reportOnce(logger, `${formPath}\0${surface}\0${componentType}`, () =>
    logger.error?.('Unsupported component in renderer', { componentType, formPath, surface }),
  );
};

export { reportUnsupportedComponent };
export type { RendererSurface, UnsupportedComponentContext };

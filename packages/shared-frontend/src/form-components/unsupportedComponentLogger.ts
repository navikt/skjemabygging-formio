import { ApplicationLogger } from '../context/application/ApplicationContext';
import { UnsupportedCustomValidation } from './custom-validation/unsupportedCustomValidation';

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

/**
 * A form the new renderer must not render, because it carries a `validate.custom` the renderer
 * neither reproduces nor can prove redundant. Reported the same way an unsupported component type
 * is: always logged to the backend, once per form and component.
 */
const reportUnsupportedCustomValidation = (
  logger: ApplicationLogger | undefined,
  { formPath, unsupported }: { formPath: string; unsupported: UnsupportedCustomValidation[] },
) => {
  if (!logger?.error) {
    return;
  }

  unsupported.forEach(({ componentKey, componentType, script }) =>
    reportOnce(logger, `${formPath}\0custom-validation\0${componentKey}`, () =>
      logger.error?.('Unsupported custom validation in renderer', {
        componentKey,
        componentType,
        formPath,
        script,
      }),
    ),
  );
};

export { reportUnsupportedComponent, reportUnsupportedCustomValidation };
export type { RendererSurface, UnsupportedComponentContext };

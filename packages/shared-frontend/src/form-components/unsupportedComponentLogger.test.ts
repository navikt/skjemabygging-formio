import { describe, expect, it, vi } from 'vitest';
import { ApplicationLogger } from '../context/application/ApplicationContext';
import { reportUnsupportedComponent } from './unsupportedComponentLogger';

describe('reportUnsupportedComponent', () => {
  it('logs a stable message with privacy-safe metadata', () => {
    const logger: ApplicationLogger = { error: vi.fn() };

    reportUnsupportedComponent(logger, {
      componentType: 'mysteryComponent',
      formPath: 'nav123456',
      surface: 'input',
    });

    expect(logger.error).toHaveBeenCalledWith('Unsupported component in renderer', {
      componentType: 'mysteryComponent',
      formPath: 'nav123456',
      surface: 'input',
    });
  });

  it('logs each form, surface and component type combination once per logger session', () => {
    const logger: ApplicationLogger = { error: vi.fn() };
    const context = {
      componentType: 'mysteryComponent',
      formPath: 'nav123456',
      surface: 'input' as const,
    };

    reportUnsupportedComponent(logger, context);
    reportUnsupportedComponent(logger, context);
    reportUnsupportedComponent(logger, { ...context, surface: 'summary' });
    reportUnsupportedComponent(logger, { ...context, componentType: 'anotherComponent' });
    reportUnsupportedComponent(logger, { ...context, formPath: 'nav654321' });

    expect(logger.error).toHaveBeenCalledTimes(4);
  });

  it('does nothing when error logging is unavailable', () => {
    expect(() =>
      reportUnsupportedComponent(undefined, {
        componentType: 'mysteryComponent',
        formPath: 'nav123456',
        surface: 'input',
      }),
    ).not.toThrow();
  });
});

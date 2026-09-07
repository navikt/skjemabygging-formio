import { describe, expect, it, vi } from 'vitest';
import { ApplicationLogger } from '../context/application/ApplicationContext';
import { reportUnsupportedComponent, reportUnsupportedCustomValidation } from './unsupportedComponentLogger';

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

describe('reportUnsupportedCustomValidation', () => {
  const unsupported = [
    { componentKey: 'belop', componentType: 'number', script: 'valid = input < row.maks;' },
    { componentKey: 'navn', componentType: 'textfield', script: "valid = input.length > 3 ? true : 'For kort';" },
  ];

  it('logs a stable message per component that carries an unsupported script', () => {
    const logger: ApplicationLogger = { error: vi.fn() };

    reportUnsupportedCustomValidation(logger, { formPath: 'nav123456', unsupported });

    expect(logger.error).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledWith('Unsupported custom validation in renderer', {
      componentKey: 'belop',
      componentType: 'number',
      formPath: 'nav123456',
      script: 'valid = input < row.maks;',
    });
  });

  it('logs each form and component once per logger session', () => {
    const logger: ApplicationLogger = { error: vi.fn() };

    reportUnsupportedCustomValidation(logger, { formPath: 'nav123456', unsupported });
    reportUnsupportedCustomValidation(logger, { formPath: 'nav123456', unsupported });
    reportUnsupportedCustomValidation(logger, { formPath: 'nav654321', unsupported });

    expect(logger.error).toHaveBeenCalledTimes(4);
  });

  it('does nothing when there is nothing to report, or no error logging', () => {
    const logger: ApplicationLogger = { error: vi.fn() };

    reportUnsupportedCustomValidation(logger, { formPath: 'nav123456', unsupported: [] });
    expect(logger.error).not.toHaveBeenCalled();
    expect(() => reportUnsupportedCustomValidation(undefined, { formPath: 'nav123456', unsupported })).not.toThrow();
  });
});

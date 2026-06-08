import type { RequestHandler } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const createEntraIdM2mHandler = vi.fn();
const createEntraIdOboHandler = vi.fn();

vi.mock('@navikt/skjemadigitalisering-shared-backend', async () => {
  const actual = await vi.importActual<typeof import('@navikt/skjemadigitalisering-shared-backend')>(
    '@navikt/skjemadigitalisering-shared-backend',
  );

  return {
    ...actual,
    createEntraIdM2mHandler,
    createEntraIdOboHandler,
  };
});

describe('entraIdHandlers', () => {
  beforeEach(() => {
    vi.resetModules();
    createEntraIdM2mHandler.mockReset();
    createEntraIdOboHandler.mockReset();
  });

  it('creates shared handlers with form-spec-api config and logger', async () => {
    const m2mHandler = vi.fn() as RequestHandler;
    const oboHandler = vi.fn() as RequestHandler;

    createEntraIdM2mHandler.mockReturnValue(m2mHandler);
    createEntraIdOboHandler.mockReturnValue(oboHandler);

    const { config } = await import('../config');
    const { logger } = await import('../logger');
    const { entraIdM2mHandler, entraIdOboHandler } = await import('./entraIdHandlers');

    expect(createEntraIdM2mHandler).toHaveBeenCalledWith({
      introspectionEndpoint: config.entraId.introspectionEndpoint,
      isBypassed: config.isDevelopment || config.isTest,
      logger,
    });
    expect(createEntraIdOboHandler).toHaveBeenCalledWith({
      introspectionEndpoint: config.entraId.introspectionEndpoint,
      isBypassed: config.isDevelopment || config.isTest,
      logger,
    });
    expect(entraIdM2mHandler).toBe(m2mHandler);
    expect(entraIdOboHandler).toBe(oboHandler);
  });
});

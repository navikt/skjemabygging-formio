import { createEntraIdM2mHandler, createEntraIdOboHandler } from '@navikt/skjemadigitalisering-shared-backend';
import { config } from '../config';
import { logger } from '../logger';

const createOptions = () => ({
  introspectionEndpoint: config.entraId.introspectionEndpoint,
  isBypassed: config.isDevelopment || config.isTest,
  logger,
});

const entraIdM2mHandler = createEntraIdM2mHandler(createOptions());
const entraIdOboHandler = createEntraIdOboHandler(createOptions());

export { entraIdM2mHandler, entraIdOboHandler };

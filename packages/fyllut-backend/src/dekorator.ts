import { fetchDecoratorHtml } from '@navikt/nav-dekoratoren-moduler/ssr';
import { createDecorator } from '@navikt/skjemadigitalisering-shared-backend';
import { config } from './config/config';
import { NaisCluster } from './config/nais-cluster';
import { logger } from './logger';
import { getFyllutUrl } from './utils/url';

const { getDecorator } = createDecorator({
  enabled: !config.noDecorator,
  env: config.naisClusterName === NaisCluster.PROD ? 'prod' : 'dev',
  fetchDecoratorHtml,
  logger,
  params: {
    level: 'Level4',
    simple: true,
    logoutWarning: true,
    analyticsQueryParams: ['sub'],
  },
});

const createRedirectUrl = (req, res) => {
  const formId = res.locals.formId;
  const baseUrl = getFyllutUrl(req);
  if (formId) {
    return `${baseUrl}?form=${res.locals.formId}`;
  }
  return baseUrl;
};

export { createRedirectUrl, getDecorator };

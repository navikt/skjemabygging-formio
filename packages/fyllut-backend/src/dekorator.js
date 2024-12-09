import { fetchDecoratorHtml } from '@navikt/nav-dekoratoren-moduler/ssr';
import { config } from './config/config';
import { NaisCluster } from './config/nais-cluster';
import { logger } from './logger';
import { getFyllutUrl } from './utils/url';

const { naisClusterName } = config;

const getDecorator = async (redirectToUrl) => {
  /**
   * https://github.com/navikt/nav-dekoratoren
   */
  if (config.noDecorator) {
    logger.debug('Skipping decorator');
    return {};
  }
  return fetchDecoratorHtml({
    env: naisClusterName === NaisCluster.PROD ? 'prod' : 'dev',
    params: {
      redirectToUrl,
      level: 'Level4',
      simple: true,
      urlLookupTable: false,
      logoutWarning: true,
      availableLanguages: [
        {
          locale: 'nb',
          url: `${redirectToUrl}/nb`,
          handleInApp: true,
        },
        {
          locale: 'nn',
          url: `${redirectToUrl}/nn`,
          handleInApp: true,
        },
        {
          locale: 'en',
          url: `${redirectToUrl}/en`,
          handleInApp: true,
        },
      ],
    },
  });
};

const createRedirectUrl = (req, res) => {
  const formId = res.locals.formId;
  const baseUrl = getFyllutUrl(req);
  if (formId) {
    return `${baseUrl}?form=${res.locals.formId}`;
  }
  return baseUrl;
};

export { createRedirectUrl, getDecorator };

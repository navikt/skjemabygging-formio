import { fetchDecoratorHtml } from '@navikt/nav-dekoratoren-moduler/ssr';
import { config } from './config/config';
import { NaisCluster } from './config/nais-cluster';
import { logger } from './logger';

const { naisClusterName } = config;

const getDecorator = async (language = []) => {
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
      redirectToApp: true,
      level: 'Level4',
      simple: true,
      urlLookupTable: false,
      logoutWarning: true,
      language,
      availableLanguages: [
        {
          locale: 'nb',
          handleInApp: true,
        },
        {
          locale: 'nn',
          handleInApp: true,
        },
        {
          locale: 'en',
          handleInApp: true,
        },
      ],
    },
  });
};

export { getDecorator };

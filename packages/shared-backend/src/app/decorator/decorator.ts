import type { Logger } from '../../shared/logger/types';

type DecoratorEnv = 'prod' | 'dev';
type DecoratorParams = Record<string, unknown>;
type DecoratorFragments = Record<string, string>;

interface CreateDecoratorOptions {
  enabled: boolean;
  env: DecoratorEnv;
  fetchDecoratorHtml: (props: { env: DecoratorEnv; params: DecoratorParams }) => Promise<DecoratorFragments>;
  logger: Pick<Logger, 'debug'>;
  params: DecoratorParams;
}

interface GetDecoratorOptions {
  redirectToUrl: string;
  language?: string;
}

/**
 * The decorator fetcher is injected so shared-backend does not depend on @navikt/nav-dekoratoren-moduler.
 * https://github.com/navikt/nav-dekoratoren
 */
const createDecorator = ({ enabled, env, fetchDecoratorHtml, logger, params }: CreateDecoratorOptions) => {
  const getDecorator = async ({ redirectToUrl, language }: GetDecoratorOptions): Promise<DecoratorFragments> => {
    if (!enabled) {
      logger.debug('Skipping decorator');
      return {};
    }
    return fetchDecoratorHtml({ env, params: { ...params, redirectToUrl, ...(language && { language }) } });
  };

  return { getDecorator };
};

export { createDecorator };
export type { CreateDecoratorOptions, DecoratorEnv, GetDecoratorOptions };

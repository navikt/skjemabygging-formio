import type { AppLogger } from '../types';

type DecoratorEnv = 'prod' | 'dev';

interface DecoratorFetchProps<Params> {
  env: DecoratorEnv;
  params: Params;
}

interface CreateDecoratorOptions<Params extends { redirectToUrl?: string }, Fragments> {
  enabled: boolean;
  env: DecoratorEnv;
  fetchDecoratorHtml: (props: DecoratorFetchProps<Params>) => Promise<Fragments>;
  logger: Pick<AppLogger, 'debug'>;
  params: Omit<Params, 'redirectToUrl'>;
}

/**
 * The decorator fetcher is injected so shared-backend does not depend on @navikt/nav-dekoratoren-moduler.
 * https://github.com/navikt/nav-dekoratoren
 */
const createDecorator = <Params extends { redirectToUrl?: string }, Fragments>({
  enabled,
  env,
  fetchDecoratorHtml,
  logger,
  params,
}: CreateDecoratorOptions<Params, Fragments>) => {
  const getDecorator = async (redirectToUrl: string): Promise<Fragments | Record<string, never>> => {
    if (!enabled) {
      logger.debug('Skipping decorator');
      return {};
    }
    return fetchDecoratorHtml({ env, params: { ...params, redirectToUrl } as Params });
  };

  return { getDecorator };
};

export { createDecorator };
export type { CreateDecoratorOptions, DecoratorEnv, DecoratorFetchProps };

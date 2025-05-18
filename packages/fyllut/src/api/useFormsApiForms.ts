import { http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';

const useFormsApiForms = () => {
  const appConfig = useAppConfig();
  const { logger } = appConfig;
  const http = appConfig.http ?? baseHttp;
  const baseUrl = '/fyllut/api/forms';

  const get = useCallback(
    async (path: string): Promise<Form | undefined> => {
      const url = `${baseUrl}/${path}`;
      try {
        logger?.debug(`Fetching form from ${url}`);
        return await http.get<Form>(url);
      } catch (error) {
        if (error instanceof Error) {
          logger?.error(`Failed to fetch form from ${url}`, { message: error?.message });
        }
        throw error;
      }
    },
    [baseUrl, http, logger],
  );

  return {
    get,
  };
};

export default useFormsApiForms;

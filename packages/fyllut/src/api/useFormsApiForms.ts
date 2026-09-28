import { http as baseHttp, formUtils, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';

const useFormsApiForms = () => {
  const appConfig = useAppConfig();
  const { logger } = appConfig;
  const http = appConfig.http ?? baseHttp;
  const baseUrl = '/fyllut/api/forms';

  const get = useCallback(
    async (path: string, select?: string): Promise<Form | undefined> => {
      if (select?.includes('firstPanelSlug') && !select?.includes('components')) {
        select = `${select},components`;
      }

      const url = `${baseUrl}/${path}${select ? `?select=${select}` : ''}`;
      logger?.debug('Fetching Fyllut form');
      const form = await http.get<Form>(url);

      if (select?.includes('firstPanelSlug')) {
        return {
          ...form,
          firstPanelSlug: formUtils.getPanelSlug(form, 0),
        };
      } else {
        return form;
      }
    },
    [baseUrl, http, logger],
  );

  return {
    get,
  };
};

export default useFormsApiForms;

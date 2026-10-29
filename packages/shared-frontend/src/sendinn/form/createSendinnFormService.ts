import { SendinnFormRequest, SendinnFormResult } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../app/http/http';

type LoadSendinnForm = (request: SendinnFormRequest) => Promise<SendinnFormResult>;

const createSendinnFormService = ({ baseUrl, http: client }: { baseUrl: string; http: Pick<typeof http, 'get'> }) => {
  const loadForm: LoadSendinnForm = ({ formPath, language, attachmentFilter }) => {
    const query = new URLSearchParams({ lang: language });
    attachmentFilter.forEach((code) => query.append('filter', code));
    return client.get<SendinnFormResult>(`${baseUrl}/api/forms/${encodeURIComponent(formPath)}?${query}`);
  };

  return { loadForm };
};

export { createSendinnFormService };
export type { LoadSendinnForm };

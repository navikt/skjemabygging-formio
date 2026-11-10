import { SendinnFormResult } from '@navikt/skjemadigitalisering-shared-domain';
import { LoadSendinnForm } from '@navikt/skjemadigitalisering-shared-frontend';
import { SendinnHttp } from './sendinnHttp';

const createSendinnFormService = ({ baseUrl, http }: { baseUrl: string; http: SendinnHttp }) => {
  const loadForm: LoadSendinnForm = ({ formPath, language, attachmentFilter }) => {
    const query = new URLSearchParams({ lang: language });
    attachmentFilter.forEach((code) => query.append('filter', code));
    return http.get<SendinnFormResult>(`${baseUrl}/api/forms/${encodeURIComponent(formPath)}?${query}`);
  };

  return { loadForm };
};

export { createSendinnFormService };

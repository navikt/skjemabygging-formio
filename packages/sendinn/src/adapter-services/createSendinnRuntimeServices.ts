import { Enhet, SendinnCoverPageResult } from '@navikt/skjemadigitalisering-shared-domain';
import { b64toBlob, SendinnRuntimeServices } from '@navikt/skjemadigitalisering-shared-frontend';
import { SendinnHttp } from './sendinnHttp';

const createSendinnRuntimeServices = ({
  baseUrl,
  http,
}: {
  baseUrl: string;
  http: SendinnHttp;
}): SendinnRuntimeServices => ({
  host: 'sendinn',
  formData: {
    getNavUnits: () => http.get<Enhet[]>(`${baseUrl}/api/nav-units`),
  },
  coverPage: {
    create: async (request) => {
      const { pdf } = await http.post<SendinnCoverPageResult>(`${baseUrl}/api/cover-page`, request);
      return b64toBlob(pdf, 'application/pdf');
    },
  },
});

export { createSendinnRuntimeServices };

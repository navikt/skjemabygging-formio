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
      const result = await http.post<SendinnCoverPageResult>(`${baseUrl}/api/cover-page`, request);
      if (typeof result?.pdf !== 'string' || !result.pdf) throw new Error('Missing cover-page PDF.');
      const pdf = b64toBlob(result.pdf, 'application/pdf');
      if ((await pdf.slice(0, 5).text()) !== '%PDF-') throw new Error('Invalid cover-page PDF.');
      return pdf;
    },
  },
});

export { createSendinnRuntimeServices };

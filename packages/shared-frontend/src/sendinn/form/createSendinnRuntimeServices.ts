import { Enhet, SendinnCoverPageRequest, SendinnCoverPageResult } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextValue } from '../../app/config/AppConfigProvider';
import { NavUnitRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { b64toBlob } from '../../utils/blob';

type CreateSendinnCoverPage = (request: SendinnCoverPageRequest) => Promise<Blob>;
type SendinnRuntimeServices = NavUnitRuntimeServices & { coverPage: { create: CreateSendinnCoverPage } };

const createSendinnRuntimeServices = ({
  baseUrl,
  http,
}: Pick<AppConfigContextValue, 'baseUrl' | 'http'>): SendinnRuntimeServices => ({
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
export type { CreateSendinnCoverPage, SendinnRuntimeServices };

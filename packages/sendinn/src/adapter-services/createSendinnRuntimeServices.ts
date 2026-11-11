import { Enhet } from '@navikt/skjemadigitalisering-shared-domain';
import { SendinnRuntimeServices } from '@navikt/skjemadigitalisering-shared-frontend';
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
});

export { createSendinnRuntimeServices };

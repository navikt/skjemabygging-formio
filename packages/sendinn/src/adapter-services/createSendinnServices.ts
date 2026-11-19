import { FormsApiTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
import { SendinnServices } from '@navikt/skjemadigitalisering-shared-frontend';
import { createSendinnFormService } from './createSendinnFormService';
import { createSendinnRuntimeServices } from './createSendinnRuntimeServices';
import { SendinnHttp } from './sendinnHttp';

const createSendinnServices = ({ baseUrl, http }: { baseUrl: string; http: SendinnHttp }): SendinnServices => ({
  ...createSendinnFormService({ baseUrl, http }),
  loadGlobalTranslations: (language) =>
    http.get<FormsApiTranslationMap>(`${baseUrl}/api/global-translations/${language}`),
  runtime: createSendinnRuntimeServices({ baseUrl, http }),
});

export { createSendinnServices };

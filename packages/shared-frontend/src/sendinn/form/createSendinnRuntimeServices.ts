import { Enhet } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextValue } from '../../app/config/AppConfigProvider';
import { NavUnitRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';

const createSendinnRuntimeServices = ({
  baseUrl,
  http,
}: Pick<AppConfigContextValue, 'baseUrl' | 'http'>): NavUnitRuntimeServices => ({
  formData: {
    getNavUnits: () => http.get<Enhet[]>(`${baseUrl}/api/nav-units`),
  },
});

export { createSendinnRuntimeServices };

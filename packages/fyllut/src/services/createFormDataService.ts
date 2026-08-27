import { FormCodeList, FormDataService, FyllutHttp } from '@navikt/skjemadigitalisering-shared-frontend';

interface Props {
  http: FyllutHttp;
  backendBaseUrl: string;
  innsendingsId?: string;
}

const codeListPaths: Record<FormCodeList, string> = {
  areaCodes: 'area-codes',
  currencies: 'currencies',
};

const createFormDataService = ({ http, backendBaseUrl, innsendingsId }: Props): FormDataService => {
  const backendUrl = `${backendBaseUrl}/api`;
  const applicationHeaders = innsendingsId ? { 'x-innsendingsid': innsendingsId } : undefined;

  return {
    getActivities: ({ dailyTravel = false } = {}) =>
      http.get(`${backendUrl}/send-inn/activities?dagligreise=${dailyTravel}`, applicationHeaders),
    getRegisterData: ({ sourceId, queryParams = {} }) => {
      if (sourceId === 'none') {
        return Promise.resolve([]);
      }
      const params = new URLSearchParams(queryParams).toString();
      return http.get(`${backendUrl}/register-data/${sourceId}${params ? `?${params}` : ''}`);
    },
    getCodeList: (codeList) => http.get(`${backendUrl}/common-codes/${codeListPaths[codeList]}`),
    getNavUnits: () => http.get(`${backendUrl}/enhetsliste`),
  };
};

export default createFormDataService;

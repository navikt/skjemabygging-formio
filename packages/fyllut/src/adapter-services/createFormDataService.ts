import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
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
  const codeListRequests = new Map<FormCodeList, ReturnType<FormDataService['getCodeList']>>();

  const getCodeList = (codeList: FormCodeList) => {
    const cachedRequest = codeListRequests.get(codeList);
    if (cachedRequest) {
      return cachedRequest;
    }

    const request: ReturnType<FormDataService['getCodeList']> = http
      .get<ComponentValue[]>(`${backendUrl}/common-codes/${codeListPaths[codeList]}`)
      .catch((error) => {
        if (codeListRequests.get(codeList) === request) {
          codeListRequests.delete(codeList);
        }
        throw error;
      });
    codeListRequests.set(codeList, request);
    return request;
  };

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
    getCodeList,
    getNavUnits: () => http.get(`${backendUrl}/enhetsliste`),
  };
};

export default createFormDataService;

import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import httpBygger from '../util/httpBygger';

export const getFormsInProduction = async (): Promise<NavFormType[]> => {
  return await httpBygger.get('/api/import/source-forms');
};

export const overwriteForm = async (formPath: string): Promise<NavFormType> => {
  return await httpBygger.put<NavFormType>(
    `/api/forms/${formPath}/overwrite-with-prod`,
    {},
    {
      'Bygger-Formio-Token': NavFormioJs.Formio.getToken(),
    },
  );
};

const api = {
  getFormsInProduction,
  overwriteForm,
};

export default api;

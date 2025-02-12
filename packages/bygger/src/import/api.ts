import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import httpBygger from '../util/httpBygger';

export const getFormsInProduction = async (): Promise<Form[]> => {
  return await httpBygger.get('/api/import/source-forms');
};

export const overwriteForm = async (formPath: string): Promise<Form> => {
  return await httpBygger.put<Form>(`/api/import/forms/${formPath}`, {});
};

const api = {
  getFormsInProduction,
  overwriteForm,
};

export default api;

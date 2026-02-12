import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';

interface GetFormsType {
  baseUrl: string;
}
const getForms = async (props: GetFormsType) => {
  const { baseUrl } = props;
  logger.info(`Get all forms`);

  return await http.get<Form[]>(`${baseUrl}/${formsUrl}`);
};

interface GetFormType {
  baseUrl: string;
  formPath: string;
}
const getForm = async (props: GetFormType) => {
  const { baseUrl, formPath } = props;
  logger.info(`Get form ${formPath}`);

  return await http.get<Form>(`${baseUrl}/${formsUrl}/${formPath}`);
};

const formService = {
  getForms,
  getForm,
};

export default formService;

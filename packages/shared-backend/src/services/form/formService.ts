import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../http/http';
import { logger } from '../logger/logger';

interface CreateUrlType {
  baseUrl: string;
  formPath?: string;
}
const createUrl = ({ baseUrl, formPath }: CreateUrlType) => {
  return `${baseUrl}/v1/forms${formPath ? `/${formPath}` : ''}`;
};

const getForms = async (props: Omit<CreateUrlType, 'formPath'>) => {
  logger.info(`Get all forms`);

  return await http.get<Form[]>(createUrl(props));
};

const getForm = async (props: CreateUrlType) => {
  const { formPath } = props;
  logger.info(`Get form ${formPath}`);

  return await http.get<Form>(createUrl(props));
};

const formService = {
  getForms,
  getForm,
};

export default formService;

import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../http/http';
import { logger } from '../logger/logger';

interface GetTranslationsType {
  baseUrl: string;
  formPath?: string;
}
const getFormTranslations = async (props: GetTranslationsType) => {
  const { baseUrl, formPath } = props;
  logger.info(`Get form translations for ${formPath}`);

  return await http.get<FormsApiTranslation[]>(`${baseUrl}/v1/forms/${formPath}/translations`);
};

interface GetGlobalTranslationsType {
  baseUrl: string;
}
const getGlobalTranslations = async (props: GetGlobalTranslationsType) => {
  const { baseUrl } = props;
  logger.info('Get global translations');

  return await http.get<FormsApiTranslation[]>(`${baseUrl}/v1/global-translations`);
};

const translationApiService = {
  getFormTranslations,
  getGlobalTranslations,
};

export default translationApiService;

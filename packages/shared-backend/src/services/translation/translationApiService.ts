import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';
const globalTranslationUrl = 'v1/global-translations';

interface GetTranslationsType {
  baseUrl: string;
  formPath?: string;
}
const getFormTranslations = async (props: GetTranslationsType) => {
  const { baseUrl, formPath } = props;
  logger.info(`Get form translations for ${formPath}`);

  return await http.get<FormsApiTranslation[]>(`${baseUrl}/${formsUrl}/${formPath}/translations`);
};

interface GetGlobalTranslationsType {
  baseUrl: string;
}
const getGlobalTranslations = async (props: GetGlobalTranslationsType) => {
  const { baseUrl } = props;
  logger.info('Get global translations');

  return await http.get<FormsApiTranslation[]>(`${baseUrl}/${globalTranslationUrl}`);
};

const translationApiService = {
  getFormTranslations,
  getGlobalTranslations,
};

export default translationApiService;

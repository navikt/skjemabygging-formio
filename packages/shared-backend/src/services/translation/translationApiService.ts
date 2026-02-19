import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';
const globalTranslationUrl = 'v1/global-translations';

interface GetTranslationsProps {
  baseUrl: string;
  formPath?: string;
}
const getFormTranslations = async (props: GetTranslationsProps) => {
  const { baseUrl, formPath } = props;
  logger.info(`Get form translations for ${formPath}`);

  return await http.get<FormsApiTranslation[]>(`${baseUrl}/${formsUrl}/${formPath}/translations`);
};

interface GetGlobalTranslationsProps {
  baseUrl: string;
}
const getGlobalTranslations = async (props: GetGlobalTranslationsProps) => {
  const { baseUrl } = props;
  logger.info('Get global translations');

  return await http.get<FormsApiTranslation[]>(`${baseUrl}/${globalTranslationUrl}`);
};

const translationApiService = {
  getFormTranslations,
  getGlobalTranslations,
};

export default translationApiService;

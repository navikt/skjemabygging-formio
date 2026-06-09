import { FormsApiTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';
const globalTranslationUrl = 'v1/global-translations';

const buildLanguageCodesParam = (languageCodes?: TranslationLang[]): string => {
  return languageCodes ? `?${new URLSearchParams({ languageCodes: languageCodes.toString() })}` : '';
};

interface GetFormTranslationsProps {
  baseUrl: string;
  formPath?: string;
  languageCodes?: TranslationLang[];
}
const getFormTranslations = async (props: GetFormTranslationsProps) => {
  const { baseUrl, formPath, languageCodes } = props;
  logger.info(`Get form translations for ${formPath}`);

  return await http.get<FormsApiTranslation[]>(
    `${baseUrl}/${formsUrl}/${formPath}/translations${buildLanguageCodesParam(languageCodes)}`,
  );
};

interface GetGlobalTranslationsProps {
  baseUrl: string;
  languageCodes?: TranslationLang[];
}
const getGlobalTranslations = async (props: GetGlobalTranslationsProps) => {
  const { baseUrl, languageCodes } = props;
  logger.info('Get global translations');

  return await http.get<FormsApiTranslation[]>(
    `${baseUrl}/${globalTranslationUrl}${buildLanguageCodesParam(languageCodes)}`,
  );
};

const translationClient = {
  getFormTranslations,
  getGlobalTranslations,
};

export default translationClient;

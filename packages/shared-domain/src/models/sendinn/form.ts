import { Form } from '../forms-api-form';
import { FormsApiTranslationMap, TranslationLang } from '../translation';

interface SendinnFormRequest {
  formPath: string;
  language: TranslationLang;
  attachmentFilter: readonly string[];
}

interface SendinnFormResult {
  form: Form;
  languages: TranslationLang[];
  language: TranslationLang;
  translations: FormsApiTranslationMap;
  attachmentFilter: string[];
}

export type { SendinnFormRequest, SendinnFormResult };

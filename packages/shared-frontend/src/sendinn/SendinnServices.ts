import {
  FormsApiTranslationMap,
  SendinnFormRequest,
  SendinnFormResult,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { SendinnRuntimeServices } from '../context/runtime-services/RuntimeServices';

type LoadSendinnForm = (request: SendinnFormRequest) => Promise<SendinnFormResult>;

interface SendinnServices {
  loadForm: LoadSendinnForm;
  loadGlobalTranslations: (language: TranslationLang) => Promise<FormsApiTranslationMap>;
  runtime: SendinnRuntimeServices;
}

export type { LoadSendinnForm, SendinnServices };

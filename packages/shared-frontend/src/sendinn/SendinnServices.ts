import {
  FormsApiTranslationMap,
  SendinnFormRequest,
  SendinnFormResult,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { NavUnitRuntimeServices } from '../context/runtime-services/RuntimeServicesContext';

type LoadSendinnForm = (request: SendinnFormRequest) => Promise<SendinnFormResult>;

interface SendinnServices {
  loadForm: LoadSendinnForm;
  loadGlobalTranslations: (language: TranslationLang) => Promise<FormsApiTranslationMap>;
  runtime: NavUnitRuntimeServices;
}

export type { LoadSendinnForm, SendinnServices };

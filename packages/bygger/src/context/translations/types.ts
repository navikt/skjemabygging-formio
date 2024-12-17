import { FormsApiGlobalTranslation, FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationError } from './utils/errorUtils';

interface TranslationsContextValue<Translation extends FormsApiTranslation> {
  storedTranslations: Record<string, Translation>;
  isReady: boolean;
  loadTranslations: () => Promise<void>;
  saveTranslation: (translation: Translation) => Promise<Translation>;
  createNewTranslation?: (
    translation: FormsApiGlobalTranslation,
  ) => Promise<{ response?: Translation; error?: TranslationError }>;
}

export type { TranslationsContextValue };

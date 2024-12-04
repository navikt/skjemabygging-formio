import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';

//TODO move
const translationErrorTypes = ['MISSING_KEY_VALIDATION', 'CONFLICT', 'OTHER_HTTP'] as const;
type TranslationError = {
  type: (typeof translationErrorTypes)[number];
  key: string;
  isNewTranslation?: boolean;
};

const isTranslationError = (translationOrError: unknown): translationOrError is TranslationError =>
  translationErrorTypes.includes((translationOrError as TranslationError)?.type);

interface TranslationsContextValue<Translation extends FormsApiTranslation> {
  storedTranslations: Record<string, Translation>;
  isReady: boolean;
  loadTranslations: () => Promise<void>;
  saveTranslations: (translations: Translation[]) => Promise<Array<TranslationError>>;
  createNewTranslation?: (translation: FormsApiTranslation) => Promise<TranslationError | undefined>;
}

export { isTranslationError, translationErrorTypes };
export type { TranslationError, TranslationsContextValue };

import { FormsApiTranslation, TranslationTag } from '@navikt/skjemadigitalisering-shared-domain';

//TODO move
const translationErrorTypes = ['MISSING_KEY_VALIDATION', 'CONFLICT', 'OTHER_HTTP'] as const;
type TranslationError = {
  type: (typeof translationErrorTypes)[number];
  key: string;
  isNewTranslation?: boolean;
};

const isTranslationError = (translationOrError: unknown): translationOrError is TranslationError =>
  translationErrorTypes.includes((translationOrError as TranslationError)?.type);

type TranslationsPerTag = Record<TranslationTag, FormsApiTranslation[]>;

interface TranslationsContextValue {
  storedTranslations: Record<string, FormsApiTranslation>;
  loadTranslations: () => Promise<void>;
  saveTranslations: (translations: FormsApiTranslation[]) => Promise<Array<TranslationError>>;
  createNewTranslation: (translation: FormsApiTranslation) => Promise<TranslationError | undefined>;
}

export { isTranslationError, translationErrorTypes };
export type { TranslationError, TranslationsContextValue, TranslationsPerTag };

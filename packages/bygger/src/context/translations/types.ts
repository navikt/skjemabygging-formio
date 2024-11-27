import { FormsApiGlobalTranslation, TranslationTag } from '@navikt/skjemadigitalisering-shared-domain';

//TODO move
const translationErrorTypes = ['MISSING_KEY_VALIDATION', 'CONFLICT', 'OTHER_HTTP'] as const;
type TranslationError = {
  type: (typeof translationErrorTypes)[number];
  key: string;
  isNewTranslation?: boolean;
};

const isTranslationError = (translationOrError: unknown): translationOrError is TranslationError =>
  translationErrorTypes.includes((translationOrError as TranslationError)?.type);

type TranslationsPerTag = Record<TranslationTag, FormsApiGlobalTranslation[]>;

interface TranslationsContextValue {
  translationsPerTag: TranslationsPerTag;
  storedTranslations: Record<string, FormsApiGlobalTranslation>;
  loadTranslations: () => Promise<void>;
  saveTranslations: (translations: FormsApiGlobalTranslation[]) => Promise<Array<TranslationError>>;
  createNewTranslation: (translation: FormsApiGlobalTranslation) => Promise<TranslationError | undefined>;
}

export { isTranslationError, translationErrorTypes };
export type { TranslationError, TranslationsContextValue, TranslationsPerTag };

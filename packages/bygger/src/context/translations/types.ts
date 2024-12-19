import {
  FormsApiGlobalTranslation,
  FormsApiTranslation,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { Context } from 'react';
import { Status } from './editTranslationsReducer/reducerUtils';
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

interface EditTranslationsContextValue<Translation extends FormsApiTranslation> {
  updateTranslation: (original: Translation, lang: TranslationLang, value: string) => void;
  errors: TranslationError[];
  newTranslation?: Translation;
  editState: Status;
  updateNewTranslation?: (lang: TranslationLang, value: string) => void;
  saveChanges: () => Promise<void>;
}

type EditTranslationContext<Translation extends FormsApiTranslation> = Context<
  EditTranslationsContextValue<Translation>
>;

export type { EditTranslationContext, EditTranslationsContextValue, TranslationsContextValue };

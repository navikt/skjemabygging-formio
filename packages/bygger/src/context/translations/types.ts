import { FormsApiTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { Context } from 'react';
import { Status } from './editTranslationsReducer/reducerUtils';
import { TranslationError } from './utils/errorUtils';

interface EditTranslationsContextValue<Translation extends FormsApiTranslation> {
  updateTranslation: (original: Translation, lang: TranslationLang, value: string) => void;
  errors: TranslationError[];
  newTranslation?: Translation;
  editState: Status;
  updateNewTranslation?: (lang: TranslationLang, value: string) => void;
  saveChanges: () => Promise<void>;
  importFromProduction: () => Promise<void>;
}

type EditTranslationContext<Translation extends FormsApiTranslation> = Context<
  EditTranslationsContextValue<Translation>
>;

export type { EditTranslationContext, EditTranslationsContextValue };

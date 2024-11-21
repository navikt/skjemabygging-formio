import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useState } from 'react';
import { useGlobalTranslations } from './GlobalTranslationsContext';

//TODO: move me
export type TranslationLang = 'nb' | 'nn' | 'en';
type TranslationError = { type: 'MISSING_KEY_VALIDATION'; key: string; isNewTranslation?: boolean };

interface EditTranslationsContextValue {
  updateTranslation: (original: FormsApiGlobalTranslation, property: TranslationLang, value: string) => void;
  errors: TranslationError[];
  newTranslation: FormsApiGlobalTranslation;
  updateNewTranslation: (property: TranslationLang, value: string) => void;
  saveChanges: () => Promise<void>;
}

const defaultNewSkjemateksterTranslation: FormsApiGlobalTranslation = {
  key: '',
  tag: 'skjematekster',
  nb: '',
  nn: '',
  en: '',
};
const defaultValue = {
  updateTranslation: () => {},
  errors: [],
  newTranslation: defaultNewSkjemateksterTranslation,
  updateNewTranslation: () => {},
  saveChanges: () => Promise.resolve(),
};

const EditTranslationsContext = createContext<EditTranslationsContextValue>(defaultValue);

const EditTranslationsProvider = ({ children }) => {
  const [changes, setChanges] = useState<Record<string, FormsApiGlobalTranslation>>();
  const [newTranslation, setNewTranslation] = useState<FormsApiGlobalTranslation>(defaultNewSkjemateksterTranslation);
  const [errors, setErrors] = useState<TranslationError[]>([]);
  const { storedTranslations, saveTranslations } = useGlobalTranslations();

  const updateTranslation = (
    originalTranslation: FormsApiGlobalTranslation,
    property: TranslationLang,
    value: string,
  ) => {
    setChanges((current) => {
      const { key } = originalTranslation;
      const storedTranslation = storedTranslations[key];
      if ((storedTranslation?.[property] ?? '') === value) {
        return current;
      }
      console.log('setChange', current, { originalTranslation, property, value });
      const existingChange = current?.[key];
      return {
        ...current,
        [key]: { ...originalTranslation, ...existingChange, [property]: value },
      };
    });
  };

  const updateNewTranslation = (property: TranslationLang, value: string) => {
    setNewTranslation((current) => {
      if ((current?.[property] ?? '') === value) {
        return current;
      }
      if (property === 'nb') {
        return { ...current, key: value, [property]: value };
      }
      return { ...current, [property]: value };
    });
  };

  console.log(changes);

  const validate = (
    translation: FormsApiGlobalTranslation,
    isNewTranslation: boolean = false,
  ): TranslationError | undefined => {
    if (!translation.key) {
      return { key: translation.key, type: 'MISSING_KEY_VALIDATION', isNewTranslation };
    }
  };

  const saveChanges = async () => {
    const newTranslationHasData = !!(newTranslation.nb || newTranslation.nn || newTranslation.en);
    const validationError = newTranslationHasData ? validate(newTranslation, true) : undefined;
    console.log('validationError', validationError);
    if (validationError) {
      setErrors([validationError]);
    } else {
      setErrors([]);
      const updates = newTranslationHasData ? { ...changes, [newTranslation.key]: newTranslation } : changes;
      const result = await saveTranslations(Object.values(updates ?? {}));
      console.log('saveChanges', result);
      setChanges({});
      setNewTranslation(defaultNewSkjemateksterTranslation);
    }
  };

  const value = { updateTranslation, errors, newTranslation, updateNewTranslation, saveChanges };

  return <EditTranslationsContext.Provider value={value}>{children}</EditTranslationsContext.Provider>;
};

export const useEditTranslations = () => useContext(EditTranslationsContext);
export default EditTranslationsProvider;

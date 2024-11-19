import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useState } from 'react';
import { useGlobalTranslations } from './GlobalTranslationsContext';

//TODO: move me
type TranslationLang = 'nb' | 'nn' | 'en';

interface EditTranslationsContextValue {
  onTranslationChange: (original: FormsApiGlobalTranslation, property: TranslationLang, value: string) => void;
  saveChanges: () => Promise<void>;
}

const defaultValue = { onTranslationChange: () => {}, saveChanges: () => Promise.resolve() };

const EditTranslationsContext = createContext<EditTranslationsContextValue>(defaultValue);

const EditTranslationsProvider = ({ children }) => {
  const [changes, setChanges] = useState<Record<string, FormsApiGlobalTranslation>>();
  const { storedTranslations, saveTranslations } = useGlobalTranslations();

  const onTranslationChange = (
    originalTranslation: FormsApiGlobalTranslation,
    property: 'nb' | 'nn' | 'en',
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

  const saveChanges = async () => {
    const result = await saveTranslations(Object.values(changes ?? {}));
    console.log('saveChanges', result);
    setChanges({});
  };

  const value = { onTranslationChange, saveChanges };

  return <EditTranslationsContext.Provider value={value}>{children}</EditTranslationsContext.Provider>;
};

export const useEditTranslations = () => useContext(EditTranslationsContext);
export default EditTranslationsProvider;

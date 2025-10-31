import { useState } from 'react';
import { useEditFormTranslations } from '../context/translations/EditFormTranslationsContext';
import { useFormTranslations } from '../context/translations/FormTranslationsContext';
import { useGlobalTranslations } from '../context/translations/GlobalTranslationsContext';

const useKeyBasedText = () => {
  const { storedTranslations: globalTranslations } = useGlobalTranslations();
  const { storedTranslations } = useFormTranslations();
  const { addKeyBasedText, updateKeyBasedText, getTextFromCurrentChanges } = useEditFormTranslations();
  const [translationKey, setTranslationKey] = useState<Record<string, string>>({});

  const getKeyBasedText = (key?: string): string => {
    if (!key) {
      return '';
    }
    const current = getTextFromCurrentChanges(key);
    const stored = key ? (storedTranslations[key]?.nb ?? '') : '';
    const globalStored = key ? (globalTranslations[key]?.nb ?? '') : '';
    return current || stored || globalStored || '';
  };

  const setKeyBasedText = (value: string, identifier = 'none') => {
    if (translationKey[identifier]) {
      return updateKeyBasedText(value, translationKey[identifier]);
    }
    const key = addKeyBasedText(value);
    setTranslationKey((keys) => ({ ...keys, [identifier]: key }));
    return key;
  };

  return { setKeyBasedText, getKeyBasedText };
};

export default useKeyBasedText;

import { useState } from 'react';
import { useEditFormTranslations } from '../context/translations/EditFormTranslationsContext';

const useKeyBasedText = () => {
  const { addKeyBasedText, updateKeyBasedText } = useEditFormTranslations();
  const [translationKey, setTranslationKey] = useState<Record<string, string>>({});

  return (value: string, identifier = 'none') => {
    if (translationKey[identifier]) {
      return updateKeyBasedText(value, translationKey[identifier]);
    }
    const key = addKeyBasedText(value);
    setTranslationKey((keys) => ({ ...keys, [identifier]: key }));
    return key;
  };
};

export default useKeyBasedText;

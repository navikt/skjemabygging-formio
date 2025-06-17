import { useState } from 'react';
import { useEditFormTranslations } from '../context/translations/EditFormTranslationsContext';

const useKeyBasedText = () => {
  const { addNBText } = useEditFormTranslations();
  const [translationKey, setTranslationKey] = useState<Record<string, string>>({});

  return (value: string, identifier = 'none') => {
    const key = addNBText(value, translationKey[identifier]);
    setTranslationKey((keys) => ({ ...keys, [identifier]: key }));
    return key;
  };
};

export default useKeyBasedText;

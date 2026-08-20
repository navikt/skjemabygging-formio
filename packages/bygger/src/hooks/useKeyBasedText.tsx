import { useEditFormTranslations } from '../context/translations/EditFormTranslationsContext';
import { useFormTranslations } from '../context/translations/FormTranslationsContext';
import { useGlobalTranslations } from '../context/translations/GlobalTranslationsContext';

const useKeyBasedText = () => {
  const { storedTranslations: globalTranslations } = useGlobalTranslations();
  const { storedTranslations } = useFormTranslations();
  const { addKeyBasedText, updateKeyBasedText, getTextFromCurrentChanges, shouldWarnAboutInactiveTranslation } =
    useEditFormTranslations();

  const getKeyBasedText = (key?: string): string => {
    if (!key) {
      return '';
    }
    const current = getTextFromCurrentChanges(key);
    const stored = key ? (storedTranslations[key]?.nb ?? '') : '';
    const globalStored = key ? (globalTranslations[key]?.nb ?? '') : '';
    return current || stored || globalStored || '';
  };

  const setKeyBasedText = (value: string, existingKey?: string) => {
    if (!existingKey || storedTranslations[existingKey] || globalTranslations[existingKey]) {
      return addKeyBasedText(value, existingKey);
    }

    return updateKeyBasedText(value, existingKey);
  };

  return { setKeyBasedText, getKeyBasedText, shouldWarnAboutInactiveTranslation };
};

export default useKeyBasedText;

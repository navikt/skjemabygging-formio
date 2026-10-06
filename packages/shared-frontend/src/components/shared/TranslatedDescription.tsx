import { useMemo } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import styles from './TranslatedDescription.module.css';

interface Props {
  translationKey?: string;
}

const TranslatedDescription = ({ translationKey }: Props) => {
  const { translate } = useLanguage();
  const translatedContent = translationKey ? translate(translationKey) : '';
  const sanitizedHtml = useMemo(() => sanitizeHtml(translatedContent), [translatedContent]);
  if (!translationKey) return null;
  return <div className={styles.description} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};

export default TranslatedDescription;

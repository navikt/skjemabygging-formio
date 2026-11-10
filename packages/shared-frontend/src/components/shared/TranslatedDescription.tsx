import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import styles from './TranslatedDescription.module.css';

interface Props {
  translationKey?: string;
}

const TranslatedDescription = ({ translationKey }: Props) => {
  const { translate } = useLanguage();
  if (!translationKey) return null;
  return (
    <div className={styles.description} dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(translationKey)) }} />
  );
};

export default TranslatedDescription;

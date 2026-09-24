import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

interface Props {
  translationKey?: string;
}

const TranslatedDescription = ({ translationKey }: Props) => {
  const { translate } = useLanguage();
  if (!translationKey) return null;
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(translationKey)) }} />;
};

export default TranslatedDescription;

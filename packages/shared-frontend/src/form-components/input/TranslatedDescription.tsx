import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../shared/sanitizeHtml';

interface Props {
  children?: string;
}

const TranslatedDescription = ({ children }: Props) => {
  const { translate } = useLanguage();
  if (!children) return null;
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(children)) }} />;
};

export default TranslatedDescription;

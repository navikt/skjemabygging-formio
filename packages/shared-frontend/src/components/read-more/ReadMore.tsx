import { ReadMore as AkselReadMore } from '@navikt/ds-react';
import { useMemo } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import htmlStyles from '../shared/FormHtml.module.css';
import styles from './ReadMore.module.css';

interface ReadMoreProps {
  label: string;
  text: string;
}

const ReadMore = ({ label, text }: ReadMoreProps) => {
  const { translate } = useLanguage();
  const translatedContent = translate(text);
  const sanitizedHtml = useMemo(() => sanitizeHtml(translatedContent), [translatedContent]);

  return (
    <AkselReadMore header={translate(label)} className={styles.readMore}>
      <div className={htmlStyles.content} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </AkselReadMore>
  );
};

export default ReadMore;
export type { ReadMoreProps };

import { ReadMore as AkselReadMore } from '@navikt/ds-react';
import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

interface ReadMoreProps {
  label: string;
  text: string;
}

const ReadMore = ({ label, text }: ReadMoreProps) => {
  const { translate } = useLanguage();

  return (
    <AkselReadMore header={translate(label)}>
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(text)) }} />
    </AkselReadMore>
  );
};

export default ReadMore;
export type { ReadMoreProps };

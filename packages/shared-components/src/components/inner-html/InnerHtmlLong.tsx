import { BodyLong } from '@navikt/ds-react';
import htmlTranslationUtils from '../../util/html/htmlTranslationUtils';

interface Props {
  content: string;
  className?: string;
  spacing?: boolean;
}

const InnerHtmlLong = ({ content, className, spacing }: Props) => {
  return (
    /* @ts-expect-error BodyLong expect to contain a string, but we are passing sanitized HTML. */
    <BodyLong
      dangerouslySetInnerHTML={{ __html: htmlTranslationUtils.sanitizeHtmlString(content) }}
      className={className}
      spacing={spacing}
    />
  );
};

export default InnerHtmlLong;

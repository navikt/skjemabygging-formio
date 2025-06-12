import { BodyLong } from '@navikt/ds-react';
import htmlUtils from '../../util/html/htmlUtils';

interface Props {
  content: string;
  className?: string;
  spacing?: boolean;
}

const InnerHtmlLong = ({ content, className, spacing }: Props) => {
  // @ts-expect-error BodyLong expect to contain a string, but we are passing sanitized HTML.
  return (
    <BodyLong
      dangerouslySetInnerHTML={{ __html: htmlUtils.sanitizeHtmlString(content) }}
      className={className}
      spacing={spacing}
    />
  );
};

export default InnerHtmlLong;

import { BodyShort } from '@navikt/ds-react';
import htmlUtils from '../../util/html/htmlUtils';

interface Props {
  content: string;
  className?: string;
  spacing?: boolean;
}

const InnerHtmlShort = ({ content, className, spacing }: Props) => {
  // @ts-expect-error BodyShort expect to contain a string, but we are passing sanitized HTML.
  return (
    <BodyShort
      dangerouslySetInnerHTML={{ __html: htmlUtils.sanitizeHtmlString(content) }}
      className={className}
      spacing={spacing}
    />
  );
};

export default InnerHtmlShort;

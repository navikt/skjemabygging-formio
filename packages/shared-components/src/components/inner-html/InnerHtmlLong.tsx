import { BodyLong } from '@navikt/ds-react';
import htmlUtils from '../../util/html/htmlUtils';

interface Props {
  content: string;
  className?: string;
  spacing?: boolean;
}

const InnerHtmlLong = ({ content, className, spacing }: Props) => {
  const html = htmlUtils.sanitizeHtmlString(content);
  return (
    /* @ts-expect-error BodyLong expect to contain a string, but we are passing sanitized HTML. */
    <BodyLong dangerouslySetInnerHTML={{ __html: html }} className={className} spacing={spacing} />
  );
};

export default InnerHtmlLong;

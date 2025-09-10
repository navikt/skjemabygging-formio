import { BodyLong } from '@navikt/ds-react';
import { toHTML } from '@portabletext/to-html';
import htmlUtils from '../../util/html/htmlUtils';

interface Props {
  content: any;
  className?: string;
  spacing?: boolean;
}

const InnerHtmlLong = ({ content, className, spacing }: Props) => {
  const html =
    typeof content === 'string' ? htmlUtils.sanitizeHtmlString(content) : htmlUtils.sanitizeHtmlString(toHTML(content));
  console.log(content);
  return (
    /* @ts-expect-error BodyLong expect to contain a string, but we are passing sanitized HTML. */
    <BodyLong dangerouslySetInnerHTML={{ __html: html }} className={className} spacing={spacing} />
  );
};

export default InnerHtmlLong;

import { BodyShort } from '@navikt/ds-react';
import { toHTML } from '@portabletext/to-html';
import htmlUtils from '../../util/html/htmlUtils';

interface Props {
  content: any;
  className?: string;
  spacing?: boolean;
}

const InnerHtmlShort = ({ content, className, spacing }: Props) => {
  const html =
    typeof content === 'string'
      ? htmlUtils.sanitizeHtmlString(content)
      : htmlUtils.sanitizeHtmlString(
          toHTML(content),
        ); /* @ts-expect-error BodyShort expect to contain a string, but we are passing sanitized HTML. */
  return <BodyShort dangerouslySetInnerHTML={{ __html: html }} className={className} spacing={spacing} />;
};

export default InnerHtmlShort;

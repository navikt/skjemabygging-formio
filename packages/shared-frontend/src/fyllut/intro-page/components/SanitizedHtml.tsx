import { BodyLong } from '@navikt/ds-react';
import { createElement } from 'react';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';

interface Props {
  tag?: string;
  content: string;
  className?: string;
  spacing?: boolean;
}

const InnerHtml = ({ tag = 'div', content, className }: Props) =>
  createElement(tag, {
    className,
    dangerouslySetInnerHTML: { __html: sanitizeHtml(content) },
  });

const InnerHtmlLong = ({ content, className, spacing }: Props) => (
  // BodyLong's type only permits text children, while sanitized HTML is intentional here.
  // @ts-expect-error -- sanitized HTML preserves form-definition rich text.
  <BodyLong spacing={spacing} className={className} dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
);

export { InnerHtml, InnerHtmlLong };

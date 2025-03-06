import { htmlUtils } from '@navikt/skjemadigitalisering-shared-domain';
import React from 'react';

interface Props {
  tag?: string;
  content: string;
  className?: string;
}

const InnerHtml = ({ tag = 'div', content, className }: Props) => {
  return React.createElement(tag, {
    dangerouslySetInnerHTML: {
      __html: htmlUtils.sanitizeHtmlString(content),
    },
    className,
  });
};

export default InnerHtml;

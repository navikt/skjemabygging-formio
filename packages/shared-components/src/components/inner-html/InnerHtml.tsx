import React from 'react';
import htmlTranslationUtils from '../../util/html/htmlTranslationUtils';

interface Props {
  tag?: string;
  content: string;
  className?: string;
}

const InnerHtml = ({ tag = 'div', content, className }: Props) => {
  return React.createElement(tag, {
    dangerouslySetInnerHTML: {
      __html: htmlTranslationUtils.sanitizeHtmlString(content),
    },
    className,
  });
};

export default InnerHtml;

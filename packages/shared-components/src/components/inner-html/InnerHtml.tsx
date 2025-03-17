import React from 'react';
import htmlUtils from '../../util/html/htmlUtils';

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

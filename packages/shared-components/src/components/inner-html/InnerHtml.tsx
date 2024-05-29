import React from 'react';
import htmlConverter from '../../util/html/converters';

interface Props {
  tag?: string;
  content: string;
  className?: string;
}

const InnerHtml = ({ tag = 'div', content, className }: Props) => {
  return React.createElement(tag, {
    dangerouslySetInnerHTML: {
      __html: htmlConverter.sanitizeHtmlString(content),
    },
    className,
  });
};

export default InnerHtml;

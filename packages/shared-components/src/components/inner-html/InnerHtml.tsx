import React from 'react';
import htmlConverter from '../../util/html/converters';

interface Props {
  tag?: string;
  content: string;
}

const InnerHtml = ({ tag = 'div', content }: Props) => {
  return React.createElement(tag, {
    dangerouslySetInnerHTML: {
      __html: htmlConverter.sanitizeHtmlString(content),
    },
  });
};

export default InnerHtml;

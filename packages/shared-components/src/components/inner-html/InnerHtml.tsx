import DOMPurify from 'dompurify';
import React from 'react';

interface Props {
  tag?: string;
  content: string;
}

const InnerHtml = ({ tag = 'div', content }: Props) => {
  return React.createElement(tag, {
    dangerouslySetInnerHTML: {
      __html: DOMPurify.sanitize(content),
    },
  });
};

export default InnerHtml;

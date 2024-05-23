import DOMPurify from 'dompurify';
import React from 'react';

interface Props {
  tag?: string;
  content: string;
  className?: string;
}

const InnerHtml = ({ tag = 'div', content, className }: Props) => {
  return React.createElement(tag, {
    dangerouslySetInnerHTML: {
      __html: DOMPurify.sanitize(content, { ADD_ATTR: ['target'] }),
    },
    className,
  });
};

export default InnerHtml;

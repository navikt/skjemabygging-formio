import DOMPurify from 'dompurify';

const sanitizeOptions = { ADD_ATTR: ['target'] };

// Two passes of DOMPurify with `target` allowed; inlined so shared-frontend stays independent.
const sanitizeHtml = (content: string): string =>
  DOMPurify.sanitize(DOMPurify.sanitize(content, sanitizeOptions), sanitizeOptions);

export { sanitizeHtml };

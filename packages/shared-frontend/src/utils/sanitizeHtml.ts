import DOMPurify from 'dompurify';

const sanitizeOptions = { ADD_ATTR: ['target'] };
let relHookInitialized = false;

const ensureNoopenerHook = () => {
  if (relHookInitialized) {
    return;
  }

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (typeof node.getAttribute !== 'function' || typeof node.setAttribute !== 'function') {
      return;
    }

    if (node.nodeName !== 'A' || node.getAttribute('target') !== '_blank') {
      return;
    }

    const relValues = new Set((node.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
    relValues.add('noopener');
    relValues.add('noreferrer');
    node.setAttribute('rel', Array.from(relValues).join(' '));
  });

  relHookInitialized = true;
};

// Two passes of DOMPurify with `target` allowed; inlined so shared-frontend stays independent.
const sanitizeHtml = (content: string): string => {
  ensureNoopenerHook();
  return DOMPurify.sanitize(DOMPurify.sanitize(content, sanitizeOptions), sanitizeOptions);
};

export { sanitizeHtml };

import { useEffect, useRef } from 'react';

// Error pages replace the page content in place, so move focus to the heading and update the title
// to tell screen reader users that the page changed.
const useErrorPageFocus = (documentTitle: string) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = documentTitle;
    headingRef.current?.focus();
  }, [documentTitle]);

  return headingRef;
};

export { useErrorPageFocus };

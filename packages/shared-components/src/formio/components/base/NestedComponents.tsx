import { useEffect, useRef } from 'react';

const NestedComponents = ({ innerHtml, getRef }) => {
  const nestedRef = useRef(null);

  useEffect(() => {
    getRef(nestedRef);
  }, [getRef]);

  return <div id="nested" ref={nestedRef} dangerouslySetInnerHTML={{ __html: `${innerHtml}` }} />;
};

export default NestedComponents;

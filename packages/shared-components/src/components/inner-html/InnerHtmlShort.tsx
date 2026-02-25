import { BodyShort } from '@navikt/ds-react';
import htmlTranslationUtils from '../../../../shared-backend/src/util/html/htmlTranslationUtils';

interface Props {
  content: string;
  className?: string;
  spacing?: boolean;
}

const InnerHtmlShort = ({ content, className, spacing }: Props) => {
  return (
    /* @ts-expect-error BodyShort expect to contain a string, but we are passing sanitized HTML. */
    <BodyShort
      dangerouslySetInnerHTML={{ __html: htmlTranslationUtils.sanitizeHtmlString(content) }}
      className={className}
      spacing={spacing}
    />
  );
};

export default InnerHtmlShort;

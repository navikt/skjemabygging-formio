import { Alert, Heading } from '@navikt/ds-react';
import InnerHtmlLong from '../inner-html/InnerHtmlLong';

interface Props {
  title?: string;
  description?: string;
  translate: (key?: string) => string;
  className?: string;
}

const ImportantInformation = ({ title, description, translate, className }: Props) => {
  if (!description) {
    return null;
  }

  return (
    <Alert variant="info" className={className}>
      {title && (
        <Heading level="2" size="small" spacing>
          {translate(title)}
        </Heading>
      )}
      <InnerHtmlLong content={translate(description)} />
    </Alert>
  );
};

export default ImportantInformation;

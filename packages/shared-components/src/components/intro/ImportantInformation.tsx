import { Alert, Heading } from '@navikt/ds-react';

interface Props {
  title?: string;
  description?: string;
  className?: string;
}

const ImportantInformation = ({ title, description, className }: Props) => {
  if (!description) {
    return null;
  }

  return (
    <Alert variant="info" className={className}>
      {title && (
        <Heading level="2" size="small" spacing>
          {title}
        </Heading>
      )}
      {description}
    </Alert>
  );
};

export default ImportantInformation;

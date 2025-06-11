import { Alert, Heading } from '@navikt/ds-react';
import { useLanguages } from '../../context/languages';
import { InnerHtml } from '../../index';

interface Props {
  title?: string;
  description?: string;
  className?: string;
}

const ImportantInformation = ({ title, description, className }: Props) => {
  const { translate } = useLanguages();
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
      <InnerHtml content={translate(description)} />
    </Alert>
  );
};

export default ImportantInformation;

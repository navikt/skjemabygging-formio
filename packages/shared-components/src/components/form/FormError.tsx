import { Alert, Heading, Link } from '@navikt/ds-react';
import { MellomlagringError } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';

interface Props {
  error?: MellomlagringError;
}

const FormError = ({ error }: Props) => {
  const { translate } = useLanguages();

  if (!error) {
    return <></>;
  }
  return (
    <Alert variant="error" className="mb">
      {error.title && (
        <Heading spacing size="small" level="4">
          {translate(error.title)}
        </Heading>
      )}
      {error.linkText ? (
        <>
          {translate(error.messageStart)}
          <Link href={error.url}>{translate(error.linkText)}</Link>
          {translate(error.messageEnd)}
        </>
      ) : (
        <>{translate(error.message, error.messageParams)}</>
      )}
    </Alert>
  );
};

export default FormError;

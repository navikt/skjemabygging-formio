import { Alert, Heading, Link } from '@navikt/ds-react';
import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';

interface Props {
  submission?: Submission;
}

const FormError = ({ submission }: Props) => {
  const { translate } = useLanguages();

  if (!submission?.fyllutState?.mellomlagring?.error) {
    return <></>;
  }
  return (
    <div className="fyllut-layout">
      <Alert variant="error" className="main-col">
        {submission?.fyllutState?.mellomlagring?.error.title && (
          <Heading spacing size="small" level="3">
            {translate(submission?.fyllutState?.mellomlagring?.error.title)}
          </Heading>
        )}
        {submission?.fyllutState?.mellomlagring?.error.linkText ? (
          <>
            {translate(submission?.fyllutState?.mellomlagring?.error.messageStart)}
            <Link href={submission?.fyllutState?.mellomlagring?.error.url}>
              {translate(submission?.fyllutState?.mellomlagring?.error.linkText)}
            </Link>
            {translate(submission?.fyllutState?.mellomlagring?.error.messageEnd)}
          </>
        ) : (
          <>{translate(submission?.fyllutState?.mellomlagring?.error.message)}</>
        )}
      </Alert>
    </div>
  );
};

export default FormError;

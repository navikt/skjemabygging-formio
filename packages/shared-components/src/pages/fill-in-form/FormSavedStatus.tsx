import { BodyShort } from '@navikt/ds-react';
import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';

interface Props {
  submission?: Submission;
}

const FormError = ({ submission }: Props) => {
  const { translate } = useLanguages();

  if (!submission?.fyllutState?.mellomlagring?.savedDate) {
    return <></>;
  }
  return (
    <BodyShort as="div" size="small" textColor="subtle" className="mb-4">
      {translate('Sist lagret')} {submission?.fyllutState?.mellomlagring?.savedDate}
    </BodyShort>
  );
};

export default FormError;

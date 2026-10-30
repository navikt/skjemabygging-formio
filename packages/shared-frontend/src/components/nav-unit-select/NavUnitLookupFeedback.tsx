import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import Alert from '../alert/Alert';

interface Props {
  retry: () => void;
}

const NavUnitLookupFeedback = ({ retry }: Props) => {
  const { translate } = useLanguage();
  return (
    <Alert variant="error">
      <p role="status">{translate(TEXTS.statiske.navUnit.fetchError)}</p>
      <Button type="button" variant="secondary" onClick={retry}>
        {translate(TEXTS.statiske.navUnit.retry)}
      </Button>
    </Alert>
  );
};

export { NavUnitLookupFeedback };

import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import { useNavigate, useResolvedPath, useSearchParams } from 'react-router-dom';
import { useIntroPage } from './IntroPageContext';

const IntroPageButtonRow = () => {
  const navigate = useNavigate();
  const { translate } = useLanguages();
  const [searchParams] = useSearchParams();
  const formUrl = useResolvedPath('').pathname;
  const { form, selfDeclaration, setError } = useIntroPage();
  const innsendingsIdFromUrl = searchParams.get('innsendingsId');

  const startUrl = `${formUrl}/${innsendingsIdFromUrl ? 'oppsummering' : form.firstPanelSlug}`;

  const validationError: Tkey = 'introPage.selfDeclaration.validationError';

  const navigateToFormPage = (event) => {
    event.preventDefault();
    if (form.introPage?.enabled && !selfDeclaration) {
      setError(translate(validationError));
      return;
    }
    navigate(`${startUrl}?${searchParams.toString()}`);
  };

  return (
    <nav className="button-row button-row--center">
      <Button
        variant="primary"
        icon={<ArrowRightIcon aria-hidden />}
        iconPosition="right"
        as="a"
        onClick={navigateToFormPage}
        role="link"
        {...{ href: `${formUrl}?${searchParams.toString()}` }}
      >
        {translate(TEXTS.grensesnitt.introPage.start)}
      </Button>

      <Button variant="secondary" icon={<ArrowLeftIcon aria-hidden />} iconPosition="left" onClick={() => navigate(-1)}>
        {translate(TEXTS.grensesnitt.goBack)}
      </Button>
    </nav>
  );
};

export default IntroPageButtonRow;

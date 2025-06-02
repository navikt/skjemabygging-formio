import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { formUtils, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useNavigate, useResolvedPath, useSearchParams } from 'react-router-dom';
import { IntroPageState, useIntroPage } from './IntroPageContext';

const IntroPageButtonRow = () => {
  const navigate = useNavigate();
  const { translate } = useLanguages();
  const [searchParams] = useSearchParams();
  const formUrl = useResolvedPath('').pathname;
  const { form, state } = useIntroPage();
  const innsendingsIdFromUrl = searchParams.get('innsendingsId');
  const firstPanelSlug = formUtils.getPanelSlug(form, 0);
  const { baseUrl, submissionMethod } = useAppConfig();

  const startUrl = `${formUrl}/${innsendingsIdFromUrl ? 'oppsummering' : firstPanelSlug}`;

  const navigateToFormPage = (event) => {
    event.preventDefault();
    if (state === IntroPageState.DIGITAL || !submissionMethod) {
      const searchParamsString = searchParams.toString();
      // Important to reload page due to forced idporten login if sub=digital or if you are missing submissionMethod in appConfig.
      window.location.href = `${baseUrl}${startUrl}${searchParamsString ? `?${searchParamsString}` : ''}`;
    } else {
      navigate(`${startUrl}?${searchParams.toString()}`);
    }
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

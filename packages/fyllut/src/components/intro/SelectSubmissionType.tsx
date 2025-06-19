import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router-dom';
import IntroLinkPanel from './IntroLinkPanel';
import { IntroPageState, useIntroPage } from './IntroPageContext';

const SelectSubmissionType = () => {
  const { state } = useIntroPage();
  const location = useLocation();
  const { baseUrl } = useAppConfig();
  const { translate } = useLanguages();

  const selectLinkPanel = (state: IntroPageState) => {
    if (state) {
      if (state === IntroPageState.PAPER) {
        redirectToForm('paper');
      } else if (state === IntroPageState.DIGITAL) {
        redirectToForm('digital');
      }
    }
  };

  const redirectToForm = (sub: string) => {
    // Important to force redirect to force idporten redirect if sub=digital
    // and to make sure appCondig have the correct submissionMethod
    window.location.href = `${baseUrl}${location.pathname}${location.search ? `${location.search}&sub=${sub}` : `?sub=${sub}`}`;
  };

  if (state) return;

  return (
    <>
      <IntroLinkPanel
        onClick={() => selectLinkPanel(IntroPageState.DIGITAL)}
        href={`${baseUrl}${location.pathname}?sub=digital`}
        title={translate(TEXTS.grensesnitt.introPage.sendDigital)}
        description={translate(TEXTS.grensesnitt.introPage.sendDigitalDescription)}
        className="mb-4"
      />
      <IntroLinkPanel
        onClick={() => selectLinkPanel(IntroPageState.PAPER)}
        href={`${baseUrl}${location.pathname}?sub=paper`}
        title={translate(TEXTS.grensesnitt.introPage.sendOnPaper)}
        description={translate(TEXTS.grensesnitt.introPage.sendOnPaperDescription)}
      />
    </>
  );
};

export default SelectSubmissionType;

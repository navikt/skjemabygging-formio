import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation, useSearchParams } from 'react-router-dom';
import IntroLinkPanel from './IntroLinkPanel';
import { IntroPageState, useIntroPage } from './IntroPageContext';

const SelectSubmissionType = () => {
  const { setState, state } = useIntroPage();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { baseUrl } = useAppConfig();
  const { translate } = useLanguages();

  const selectLinkPanel = (state: IntroPageState) => {
    if (state) {
      if (state === IntroPageState.PAPER) {
        setState(state);
        updatePaperSub();
      } else if (state === IntroPageState.DIGITAL) {
        redirectToDigitalSub();
      }
    }
  };

  const updatePaperSub = () => {
    searchParams.set('sub', 'paper');
    setSearchParams(searchParams);
  };

  const redirectToDigitalSub = () => {
    // Important to force redirect to force idporten redirect if sub=digital.
    window.location.href = `${baseUrl}${location.pathname}${location.search ? `${location.search}&sub=digital` : '?sub=paper'}`;
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

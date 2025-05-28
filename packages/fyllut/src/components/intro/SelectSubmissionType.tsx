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
    setState(state);
    if (state) {
      if (state === IntroPageState.PAPER) {
        updateSubParam('paper');
      } else if (state === IntroPageState.DIGITAL) {
        updateSubParam('digital');
      }
    }
  };

  const updateSubParam = (value: string) => {
    searchParams.set('sub', value);
    setSearchParams(searchParams);
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

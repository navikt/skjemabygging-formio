import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { useLocation, useSearchParams } from 'react-router-dom';
import IntroLinkPanel from './IntroLinkPanel';
import { IntroPageState, useIntroPage } from './IntroPageContext';

const SelectSubmissionType = () => {
  const { setState, state } = useIntroPage();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { baseUrl } = useAppConfig();

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
        title="Logg inn og send digitalt"
        description="Det er enklest og raskest å søke digitalt."
        className="mb-4"
      />
      <IntroLinkPanel
        onClick={() => selectLinkPanel(IntroPageState.PAPER)}
        href={`${baseUrl}${location.pathname}?sub=paper`}
        title="Fyll ut digitalt og send i posten"
        description="Du fyller ut søknaden før du skriver den ut."
      />
    </>
  );
};

export default SelectSubmissionType;

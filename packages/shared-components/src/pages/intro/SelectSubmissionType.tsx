import { ArrowUndoIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { IntroPageState, useIntroPage } from './IntroPageContext';
import DigitalLinkPanel from './LinkPanels/DigitalLinkPanel';
import DigitalNoLoginLinkPanel from './LinkPanels/DigitalNoLoginLinkPanel';
import NoLoginLinkPanel from './LinkPanels/NoLoginLinkPanel';
import PaperLinkPanel from './LinkPanels/PaperLinkPanel';

const SelectSubmissionType = () => {
  const { state, setState } = useIntroPage();
  const { translate } = useLanguages();
  const { setTitle, setFormProgressVisible } = useForm();

  useEffect(() => {
    if (state === IntroPageState.NO_LOGIN) {
      setTitle(TEXTS.grensesnitt.introPage.noLogin);
    } else {
      setTitle(undefined);
    }
    setFormProgressVisible(false);
  }, [setTitle, setFormProgressVisible, state]);

  return (
    <>
      <DigitalLinkPanel />
      <NoLoginLinkPanel />
      <DigitalNoLoginLinkPanel />
      <PaperLinkPanel />
      {state === IntroPageState.NO_LOGIN && (
        <Button
          variant="tertiary"
          icon={<ArrowUndoIcon aria-hidden />}
          onClick={() => setState(IntroPageState.DEFAULT)}
        >
          {translate(TEXTS.grensesnitt.introPage.changeSubmissionMethod)}
        </Button>
      )}
    </>
  );
};

export default SelectSubmissionType;

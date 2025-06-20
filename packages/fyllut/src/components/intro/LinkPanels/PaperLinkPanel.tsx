import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router-dom';
import IntroLinkPanel from '../IntroLinkPanel';
import { IntroPageState, useIntroPage } from '../IntroPageContext';

const PaperLinkPanel = () => {
  const { form, state, forceRedirectToSub, showSelectSubmissionType } = useIntroPage();
  const location = useLocation();
  const { baseUrl } = useAppConfig();
  const { translate } = useLanguages();

  const show = () => {
    return (
      showSelectSubmissionType() &&
      submissionTypesUtils.isPaperSubmission(form.properties.submissionTypes) &&
      (state === IntroPageState.NO_LOGIN ||
        (state === IntroPageState.DEFAULT &&
          !submissionTypesUtils.isDigitalNoLoginSubmission(form.properties.submissionTypes)))
    );
  };

  return (
    <>
      {show() && (
        <IntroLinkPanel
          onClick={() => forceRedirectToSub('paper')}
          href={`${baseUrl}${location.pathname}?sub=paper`}
          title={translate(TEXTS.grensesnitt.introPage.sendOnPaper)}
          description={translate(TEXTS.grensesnitt.introPage.sendOnPaperDescription)}
          className="mb-4"
        />
      )}
    </>
  );
};

export default PaperLinkPanel;

import { submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router';
import { useAppConfig } from '../../../context/config/configContext';
import { useLanguages } from '../../../context/languages';
import IntroLinkPanel from '../IntroLinkPanel';
import { IntroPageState, useIntroPage } from '../IntroPageContext';

const DigitalNoLoginLinkPanel = () => {
  const { form, state, showSelectSubmissionType, forceRedirectToSub } = useIntroPage();
  const location = useLocation();
  const { baseUrl } = useAppConfig();
  const { translate } = useLanguages();

  const show = () => {
    return (
      showSelectSubmissionType() &&
      submissionTypesUtils.isDigitalNoLoginSubmission(form.properties.submissionTypes) &&
      (state === IntroPageState.NO_LOGIN ||
        (state === IntroPageState.DEFAULT &&
          (!submissionTypesUtils.isDigitalSubmission(form.properties.submissionTypes) ||
            !submissionTypesUtils.isPaperSubmission(form.properties.submissionTypes))))
    );
  };

  return (
    <>
      {show() && (
        <IntroLinkPanel
          onClick={() => forceRedirectToSub('digitalnologin', 'legitimasjon')}
          href={`${baseUrl}${location.pathname}/legitimasjon?sub=digitalnologin`}
          title={translate(TEXTS.grensesnitt.introPage.sendDigitalNoLogin)}
          description={translate(TEXTS.grensesnitt.introPage.sendDigitalNoLoginDescription)}
          className="mb-4"
        />
      )}
    </>
  );
};

export default DigitalNoLoginLinkPanel;

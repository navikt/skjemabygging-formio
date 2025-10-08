import { submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router';
import { useAppConfig } from '../../../context/config/configContext';
import { useLanguages } from '../../../context/languages';
import IntroLinkPanel from '../IntroLinkPanel';
import { IntroPageState, useIntroPage } from '../IntroPageContext';

const NoLoginLinkPanel = () => {
  const { state, setState, form, showSelectSubmissionType } = useIntroPage();
  const location = useLocation();
  const { baseUrl } = useAppConfig();
  const { translate } = useLanguages();

  const show = () => {
    return (
      showSelectSubmissionType() &&
      state === IntroPageState.DEFAULT &&
      submissionTypesUtils.isPaperSubmission(form.properties.submissionTypes) &&
      submissionTypesUtils.isDigitalNoLoginSubmission(form.properties.submissionTypes) &&
      submissionTypesUtils.isDigitalSubmission(form.properties.submissionTypes)
    );
  };

  return (
    <>
      {show() && (
        <IntroLinkPanel
          onClick={() => setState(IntroPageState.NO_LOGIN)}
          href={`${baseUrl}${location.pathname}`}
          title={translate(TEXTS.grensesnitt.introPage.noLogin)}
          description={translate(TEXTS.grensesnitt.introPage.noLoginDescription)}
          className="mb-4"
        />
      )}
    </>
  );
};

export default NoLoginLinkPanel;

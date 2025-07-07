import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router-dom';
import IntroLinkPanel from '../IntroLinkPanel';
import { IntroPageState, useIntroPage } from '../IntroPageContext';

const DigitalLinkPanel = () => {
  const { state, form, forceRedirectToSub, showSelectSubmissionType } = useIntroPage();
  const location = useLocation();
  const { baseUrl } = useAppConfig();
  const { translate } = useLanguages();

  const show = () => {
    return (
      showSelectSubmissionType() &&
      submissionTypesUtils.isDigitalSubmission(form.properties.submissionTypes) &&
      state === IntroPageState.DEFAULT
    );
  };

  return (
    <>
      {show() && (
        <IntroLinkPanel
          onClick={() => forceRedirectToSub('digital')}
          href={`${baseUrl}${location.pathname}?sub=digital`}
          title={translate(TEXTS.grensesnitt.introPage.sendDigital)}
          description={translate(TEXTS.grensesnitt.introPage.sendDigitalDescription)}
          className="mb-4"
        />
      )}
    </>
  );
};

export default DigitalLinkPanel;

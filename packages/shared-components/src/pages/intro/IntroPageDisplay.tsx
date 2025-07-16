import { useIntroPage } from './IntroPageContext';
import IntroPageDynamic from './IntroPageDynamic';
import IntroPageStatic from './IntroPageStatic';
import SelectSubmissionType from './SelectSubmissionType';

const IntroPageDisplay = () => {
  const { form, showSelectSubmissionType } = useIntroPage();

  return (
    <>
      {showSelectSubmissionType() ? (
        <SelectSubmissionType />
      ) : form.introPage?.enabled ? (
        <IntroPageDynamic />
      ) : (
        <IntroPageStatic />
      )}
    </>
  );
};

export default IntroPageDisplay;

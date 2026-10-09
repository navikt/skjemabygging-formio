import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { FrontPageButton, MyPageLink } from './ErrorActions';
import { ErrorPageLayout } from './ErrorPageLayout';
import { NotFoundContent } from './NotFoundContent';
import { useErrorPageFocus } from './useErrorPageFocus';

// Shows the same content for every reason, so it never reveals whether a form or task exists.
const UnavailablePage = () => {
  const { translate, currentLanguage } = useLanguage();
  const headingRef = useErrorPageFocus(translate(TEXTS.statiske.error.notFoundTitle));

  return (
    <ErrorPageLayout>
      <NotFoundContent translate={translate} headingRef={headingRef} />
      <FrontPageButton translate={translate} locale={currentLanguage} />
      <MyPageLink translate={translate} locale={currentLanguage} />
    </ErrorPageLayout>
  );
};

export { UnavailablePage };

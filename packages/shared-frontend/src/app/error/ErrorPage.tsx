import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { MyPageLink } from './ErrorActions';
import { ErrorPageLayout } from './ErrorPageLayout';
import { ServerErrorContent } from './ServerErrorContent';
import { useErrorPageFocus } from './useErrorPageFocus';

const ErrorPage = ({ correlationId }: { correlationId?: string }) => {
  const { translate, currentLanguage } = useLanguage();
  const headingRef = useErrorPageFocus(translate(TEXTS.statiske.error.serverErrorTitle));

  return (
    <ErrorPageLayout>
      <ServerErrorContent
        translate={translate}
        locale={currentLanguage}
        correlationId={correlationId}
        headingRef={headingRef}
      />
      <MyPageLink translate={translate} locale={currentLanguage} />
    </ErrorPageLayout>
  );
};

export { ErrorPage };

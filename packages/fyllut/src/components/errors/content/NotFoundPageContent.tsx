import { useLanguageCodeFromURL, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { FrontPageButton, NotFoundContent, ReportBugLink } from '@navikt/skjemadigitalisering-shared-frontend';

export function NotFoundPageContent() {
  const { translate } = useLanguages();
  const locale = useLanguageCodeFromURL() ?? 'nb';

  return (
    <>
      <NotFoundContent translate={translate} />
      <ReportBugLink translate={translate} locale={locale} />
      <FrontPageButton translate={translate} locale={locale} />
    </>
  );
}

import { BugIcon } from '@navikt/aksel-icons';
import { Button, Link } from '@navikt/ds-react';
import { stringUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { navUrls } from './navUrls';
import { ErrorContentProps } from './types';

const FrontPageButton = ({ translate, locale }: ErrorContentProps) => (
  <Button as="a" href={navUrls.BASE_URL(locale)}>
    {translate(TEXTS.statiske.error.goToFrontPage)}
  </Button>
);

const MyPageLink = ({ translate, locale }: ErrorContentProps) => (
  <Link href={navUrls.MY_PAGE(locale)}>{stringUtils.capitalize(translate(TEXTS.statiske.error.goToMyPage))}</Link>
);

const ReportBugLink = ({ translate, locale }: ErrorContentProps) => (
  <Link href={navUrls.REPORT_BUG(locale)}>
    <BugIcon aria-hidden />
    {translate(TEXTS.statiske.error.reportError)}
  </Link>
);

export { FrontPageButton, MyPageLink, ReportBugLink };

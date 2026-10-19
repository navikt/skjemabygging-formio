import { BugIcon } from '@navikt/aksel-icons';
import { Link } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { navUrls } from '../navUrls';
import { ErrorContentProps } from '../types';

const ReportBugLink = ({ translate, locale }: ErrorContentProps) => (
  <Link href={navUrls.REPORT_BUG(locale)}>
    <BugIcon aria-hidden />
    {translate(TEXTS.statiske.error.reportError)}
  </Link>
);

export { ReportBugLink };

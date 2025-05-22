import { BugIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Heading, Link } from '@navikt/ds-react';
import { useLanguageCodeFromURL, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PATHS } from '../../../util/paths';

export function NotFoundPageContent() {
  const { translate } = useLanguages();
  const locale = useLanguageCodeFromURL() ?? 'nb';

  return (
    <>
      <div>
        <Heading size="large" spacing>
          {translate(TEXTS.statiske.error.notFoundTitle)}
        </Heading>
        <BodyShort>{translate(TEXTS.statiske.error.notFoundMessage)}</BodyShort>
      </div>
      <Link href={PATHS.REPORT_BUG(locale)}>
        <BugIcon aria-hidden />
        {translate(TEXTS.statiske.error.reportError)}
      </Link>
      <Button as="a" href={PATHS.BASE_URL(locale)}>
        {translate(TEXTS.statiske.error.goToFrontPage)}
      </Button>
    </>
  );
}

import { BodyShort, Button, Heading, Link } from '@navikt/ds-react';
import { useLanguageCodeFromURL, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { stringUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router';
import { PATHS } from '../../../util/paths';

export function FormNotFoundContent() {
  const { translate } = useLanguages();
  const locale = useLanguageCodeFromURL() ?? 'nb';
  const location = useLocation();
  const url = location.state?.url;

  return (
    <>
      <div>
        <Heading size="large" spacing>
          {translate(TEXTS.statiske.error.formNotFound.title)}
        </Heading>
        <BodyShort>{translate(TEXTS.statiske.error.formNotFound.message)}</BodyShort>
      </div>
      <Button as="a" href={url || PATHS.BASE_URL(locale)}>
        {translate(TEXTS.statiske.error.startNewForm)}
      </Button>
      <Link href={PATHS.MY_PAGE(locale)}>{stringUtils.capitalize(translate(TEXTS.statiske.error.goToMyPage))}</Link>
    </>
  );
}

import { BodyShort, Button, Heading } from '@navikt/ds-react';
import { useLanguageCodeFromURL, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MyPageLink, navUrls } from '@navikt/skjemadigitalisering-shared-frontend';
import { useLocation } from 'react-router';

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
      <Button as="a" href={url || navUrls.BASE_URL(locale)}>
        {translate(TEXTS.statiske.error.startNewForm)}
      </Button>
      <MyPageLink translate={translate} locale={locale} />
    </>
  );
}

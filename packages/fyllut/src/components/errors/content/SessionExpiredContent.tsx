import { BodyShort, Heading, Link } from '@navikt/ds-react';
import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useSearchParams } from 'react-router';

const SessionExpiredContent = () => {
  const { translate } = useLanguages();
  const [searchParams] = useSearchParams();
  const formPath = searchParams.get('form_path');
  const { fyllutBaseURL } = useAppConfig();

  return (
    <div>
      <Heading size="large" spacing>
        {translate(TEXTS.statiske.error.sessionExpired.title)}
      </Heading>
      <BodyShort spacing>{translate(TEXTS.statiske.error.sessionExpired.message)}</BodyShort>
      <BodyShort spacing>{translate(TEXTS.statiske.error.sessionExpired.additionalMessage)}</BodyShort>
      {formPath && (
        <Link href={`${fyllutBaseURL}/${formPath}`}>{translate(TEXTS.statiske.error.sessionExpired.buttonText)}</Link>
      )}
    </div>
  );
};

export default SessionExpiredContent;

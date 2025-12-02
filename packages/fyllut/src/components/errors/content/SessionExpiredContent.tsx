import { BodyShort, Heading, Link } from '@navikt/ds-react';
import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import React, { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const SessionExpiredContent = () => {
  const { translate } = useLanguages();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formPath = searchParams.get('form_path');
  const { fyllutBaseURL, logEvent } = useAppConfig();

  const logRestartAfterSessionExpiredEvent = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      await logEvent?.({
        name: 'skjema restartet',
        data: {
          skjemaId: searchParams.get('form_number') as string,
          skjemaPath: formPath as string,
          sessionExpired: true,
        },
      });
      navigate(`/${formPath}`);
    },
    [logEvent, searchParams, formPath, navigate],
  );

  return (
    <div>
      <Heading size="large" spacing>
        {translate(TEXTS.statiske.error.sessionExpired.title)}
      </Heading>
      <BodyShort spacing>{translate(TEXTS.statiske.error.sessionExpired.message)}</BodyShort>
      <BodyShort spacing>{translate(TEXTS.statiske.error.sessionExpired.additionalMessage)}</BodyShort>
      {formPath && (
        <Link href={`${fyllutBaseURL}/${formPath}`} onClick={logRestartAfterSessionExpiredEvent}>
          {translate(TEXTS.statiske.error.sessionExpired.buttonText)}
        </Link>
      )}
    </div>
  );
};

export default SessionExpiredContent;

import { Alert, BodyShort, Heading, Link } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';

interface Props {
  loginUrl: string;
}

const SessionExpiredMessage = ({ loginUrl }: Props) => {
  const { translate } = useLanguage();

  return (
    <Alert variant="warning" role="alert">
      <Heading size="small" level="2" spacing>
        {translate(TEXTS.statiske.error.loggedOut.title)}
      </Heading>
      <BodyShort spacing>{translate(TEXTS.statiske.error.loggedOut.message)}</BodyShort>
      <Link href={loginUrl}>{translate(TEXTS.statiske.error.loggedOut.login)}</Link>
    </Alert>
  );
};

export { SessionExpiredMessage };

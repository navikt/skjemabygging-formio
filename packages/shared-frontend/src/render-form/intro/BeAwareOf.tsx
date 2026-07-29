import { Heading, List } from '@navikt/ds-react';
import { SubmissionMethod, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';

const BeAwareOf = ({
  submissionMethod,
  tokenExpiration,
}: {
  submissionMethod?: SubmissionMethod;
  tokenExpiration?: number;
}) => {
  const { translate } = useLanguage();
  const tokenExpirationTime = tokenExpiration ? dateUtils.formatUnixEpochSecondsToLocalTime(tokenExpiration) : 'XX.XX';
  const bulletPoints = [
    ...(submissionMethod === 'paper'
      ? ['introPage.beAwareOf.sendByMail', 'introPage.beAwareOf.timeLimit']
      : submissionMethod === 'digitalnologin'
        ? [translate('introPage.beAwareOf.timeLimitNologin', { tokenExpirationTime }), 'introPage.beAwareOf.notSave']
        : []),
    'introPage.beAwareOf.mandatoryFields',
    'introPage.beAwareOf.useOfPublicComputers',
  ];

  return (
    <section>
      <Heading level="2" size="large" spacing>
        {translate('introPage.beAwareOf.title')}
      </Heading>
      <List data-aksel-migrated-v8>
        {bulletPoints.map((bulletPoint, index) => (
          <List.Item key={`${bulletPoint}-${index}`}>
            {typeof bulletPoint === 'string' ? translate(bulletPoint) : bulletPoint}
          </List.Item>
        ))}
      </List>
    </section>
  );
};

export default BeAwareOf;

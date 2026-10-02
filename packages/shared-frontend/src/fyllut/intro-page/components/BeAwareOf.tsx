import { Heading } from '@navikt/ds-react';
import { SubmissionMethod, TranslateFunction, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import IntroBulletPoints from './IntroBulletPoints';

interface Props {
  tokenExp?: number;
  translate: TranslateFunction;
  submissionMethod?: SubmissionMethod;
  className?: string;
}

const BeAwareOf = ({ tokenExp, translate, submissionMethod, className }: Props) => {
  const tokenExpirationTime = tokenExp ? dateUtils.formatUnixEpochSecondsToLocalTime(tokenExp) : 'XX.XX';
  const values = [
    ...(submissionMethod === 'paper' ? ['introPage.beAwareOf.sendByMail', 'introPage.beAwareOf.timeLimit'] : []),
    ...(submissionMethod === 'digitalnologin'
      ? [
          { key: 'introPage.beAwareOf.timeLimitNologin', params: { tokenExpirationTime } },
          'introPage.beAwareOf.notSave',
        ]
      : []),
    'introPage.beAwareOf.mandatoryFields',
    'introPage.beAwareOf.useOfPublicComputers',
  ];

  return (
    <div className={className}>
      <Heading level="2" size="large" spacing>
        {translate('introPage.beAwareOf.title')}
      </Heading>
      <IntroBulletPoints
        values={values.map((value) =>
          typeof value === 'string' ? translate(value) : translate(value.key, value.params),
        )}
      />
    </div>
  );
};

export default BeAwareOf;

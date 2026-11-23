import { Heading } from '@navikt/ds-react';
import {
  SubmissionMethod,
  TranslateFunction,
  dateUtils,
  introPageTexts,
} from '@navikt/skjemadigitalisering-shared-domain';
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
    ...(submissionMethod === 'paper' ? [introPageTexts.beAwareOf.sendByMail, introPageTexts.beAwareOf.timeLimit] : []),
    ...(submissionMethod === 'digitalnologin'
      ? [
          { key: introPageTexts.beAwareOf.timeLimitNologin, params: { tokenExpirationTime } },
          introPageTexts.beAwareOf.notSave,
        ]
      : []),
    introPageTexts.beAwareOf.mandatoryFields,
    introPageTexts.beAwareOf.useOfPublicComputers,
  ];

  return (
    <div className={className}>
      <Heading level="2" size="large" spacing>
        {translate(introPageTexts.beAwareOf.title)}
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

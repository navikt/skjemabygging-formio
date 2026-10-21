import { Heading } from '@navikt/ds-react';
import {
  IntroPageSection,
  SubmissionMethod,
  TElement,
  Tkey,
  TranslateFunction,
  dateUtils,
  introPageTexts,
} from '@navikt/skjemadigitalisering-shared-domain';
import IntroBulletPoints from './shared/IntroBulletPoints';
import { tElement, tElementTranslator } from './utils/translate';

interface Props {
  properties?: IntroPageSection;
  translate: TranslateFunction;
  submissionMethod?: SubmissionMethod;
  className?: string;
  tokenExp?: number | undefined;
}

const BeAwareOf = ({ tokenExp, translate, submissionMethod, className }: Props) => {
  const isPaperSubmission = submissionMethod === 'paper';
  const isDigitalNoLoginSubmission = submissionMethod === 'digitalnologin';
  const tokenExpirationTime = tokenExp ? dateUtils.formatUnixEpochSecondsToLocalTime(tokenExp) : 'XX.XX';

  const paperSubmissionBulletPoints: Tkey[] = isPaperSubmission
    ? [introPageTexts.beAwareOf.sendByMail, introPageTexts.beAwareOf.timeLimit]
    : [];
  const nologinSubmissionBulletPoints: TElement[] = isDigitalNoLoginSubmission
    ? [tElement(introPageTexts.beAwareOf.timeLimitNologin, { tokenExpirationTime }), introPageTexts.beAwareOf.notSave]
    : [];
  const staticBulletPoints: Tkey[] = [
    introPageTexts.beAwareOf.mandatoryFields,
    introPageTexts.beAwareOf.useOfPublicComputers,
  ];

  const submissionMethodBulletPoints: TElement[] = [...paperSubmissionBulletPoints, ...nologinSubmissionBulletPoints];
  const bulletPoints = [...submissionMethodBulletPoints, ...staticBulletPoints].map(tElementTranslator(translate));
  return (
    <div className={className}>
      <Heading level="2" size="large" spacing>
        {translate(introPageTexts.beAwareOf.title)}
      </Heading>
      <IntroBulletPoints values={bulletPoints} />
    </div>
  );
};

export default BeAwareOf;

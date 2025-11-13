import { Heading } from '@navikt/ds-react';
import { IntroPageSection, SubmissionMethod, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import IntroBulletPoints from './shared/IntroBulletPoints';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: string) => string;
  submissionMethod?: SubmissionMethod;
  className?: string;
}

const BeAwareOf = ({ translate, submissionMethod, className }: Props) => {
  const isPaperSubmission = submissionMethod === 'paper';
  const isDigitalNoLoginSubmission = submissionMethod === 'digitalnologin';

  const paperSubmissionBulletPoints: Tkey[] = isPaperSubmission
    ? ['introPage.beAwareOf.sendByMail', 'introPage.beAwareOf.timeLimit']
    : [];
  const nologinSubmissionBulletPoints: Tkey[] = isDigitalNoLoginSubmission ? ['introPage.beAwareOf.notSave'] : [];
  const staticBulletPoints: Tkey[] = [
    'introPage.beAwareOf.mandatoryFields',
    'introPage.beAwareOf.useOfPublicComputers',
  ];

  const submissionMethodBulletPoints: Tkey[] = [...paperSubmissionBulletPoints, ...nologinSubmissionBulletPoints];
  const bulletPoints = [...submissionMethodBulletPoints, ...staticBulletPoints].map(translate);
  return (
    <div className={className}>
      <Heading level="2" size="large" spacing>
        {translate('introPage.beAwareOf.title')}
      </Heading>
      <IntroBulletPoints values={bulletPoints} />
    </div>
  );
};

export default BeAwareOf;

import { Heading } from '@navikt/ds-react';
import { IntroPageSection, SubmissionMethod, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import IntroBulletPoints from './shared/IntroBulletPoints';
import IntroDescription from './shared/IntroDescription';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: string) => string;
  submissionMethod?: SubmissionMethod;
  className?: string;
}

const Prerequisites = ({ properties, translate, submissionMethod, className }: Props) => {
  if (!properties?.title) {
    return null;
  }

  const isPaperSubmission = submissionMethod === 'paper';

  const paperBulletPoints: Tkey[] = isPaperSubmission ? ['introPage.prerequisites.sendByMail'] : [];
  const staticBulletPoints: Tkey[] = [
    'introPage.prerequisites.mandatoryFields',
    'introPage.prerequisites.useOfPublicComputers',
  ];
  const bulletPoints = [...paperBulletPoints, ...staticBulletPoints, ...(properties?.bulletPoints ?? [])].map(
    translate,
  );

  return (
    <div className={className}>
      <Heading level="2" size="large" spacing>
        {translate(properties.title)}
      </Heading>
      <IntroDescription description={translate(properties?.description)} />
      <IntroBulletPoints values={bulletPoints} />
    </div>
  );
};

export default Prerequisites;

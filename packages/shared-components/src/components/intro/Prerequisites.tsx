import { Heading } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import IntroBulletPoints from './shared/IntroBulletPoints';
import IntroDescription from './shared/IntroDescription';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: string) => string;
  className?: string;
}

const Prerequisites = ({ properties, translate, className }: Props) => {
  if (!properties?.title) {
    return null;
  }

  const bulletPoints = (properties?.bulletPoints ?? []).map(translate);

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

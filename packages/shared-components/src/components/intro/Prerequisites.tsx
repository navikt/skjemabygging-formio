import { Heading } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import IntroBulletPoints from './shared/IntroBulletPoints';
import IntroDescription from './shared/IntroDescription';

interface Props {
  properties?: IntroPageSection;
  className?: string;
}

const Prerequisites = ({ properties, className }: Props) => {
  if (!properties?.title) {
    return null;
  }

  return (
    <div className={className}>
      <Heading level="2" size="large" spacing>
        {properties.title}
      </Heading>
      <IntroDescription properties={properties} />
      <IntroBulletPoints properties={properties} />
    </div>
  );
};

export default Prerequisites;

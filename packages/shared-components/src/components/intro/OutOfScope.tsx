import { Heading } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import IntroBulletPoints from './shared/IntroBulletPoints';
import IntroDescription from './shared/IntroDescription';

interface Props {
  properties?: IntroPageSection;
  className?: string;
}

const OutOfScope = ({ properties, className }: Props) => {
  if (!properties?.title) {
    return null;
  }

  return (
    <div className={className}>
      <Heading level="3" size="medium" spacing>
        {properties.title}
      </Heading>
      <IntroDescription properties={properties} />
      <IntroBulletPoints properties={properties} />
    </div>
  );
};

export default OutOfScope;

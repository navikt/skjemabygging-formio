import { Heading } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';
import IntroBulletPoints from './shared/IntroBulletPoints';
import IntroDescription from './shared/IntroDescription';

interface Props {
  properties?: IntroPageSection;
  className?: string;
}

const OutOfScope = ({ properties, className }: Props) => {
  const { translate } = useLanguages();

  if (!properties?.title) {
    return null;
  }

  return (
    <div className={className}>
      <Heading level="3" size="medium" spacing>
        {translate(properties.title)}
      </Heading>
      <IntroDescription properties={properties} />
      <IntroBulletPoints properties={properties} />
    </div>
  );
};

export default OutOfScope;

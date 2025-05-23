import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from '../shared/IntroAccordion';

interface Props {
  properties?: IntroPageSection;
  className?: string;
}

const Optional = ({ properties, className }: Props) => {
  if (!properties?.title) {
    return null;
  }

  return <IntroAccordion properties={properties} className={className} />;
};

export default Optional;

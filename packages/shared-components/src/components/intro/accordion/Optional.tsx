import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from '../shared/IntroAccordion';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: string) => string;
  className?: string;
}

const Optional = ({ properties, translate, className }: Props) => {
  if (!properties?.title) {
    return null;
  }

  const bulletPoints = (properties?.bulletPoints ?? []).map(translate);

  return (
    <IntroAccordion
      title={translate(properties.title)}
      description={translate(properties?.description)}
      bulletPoints={bulletPoints}
      className={className}
    />
  );
};

export default Optional;

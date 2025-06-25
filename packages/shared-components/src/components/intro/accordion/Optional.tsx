import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from '../shared/IntroAccordion';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: string) => string;
  className?: string;
  defaultOpen?: boolean;
}

const Optional = ({ properties, translate, className, defaultOpen }: Props) => {
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
      defaultOpen={defaultOpen}
    />
  );
};

export default Optional;

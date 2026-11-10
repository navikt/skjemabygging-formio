import { IntroPageSection, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from './IntroAccordion';

interface Props {
  properties?: IntroPageSection;
  translate: TranslateFunction;
  className?: string;
  defaultOpen?: boolean;
}

const Optional = ({ properties, translate, className, defaultOpen }: Props) => {
  if (!properties?.title) {
    return null;
  }

  return (
    <IntroAccordion
      title={translate(properties.title)}
      description={translate(properties.description)}
      bulletPoints={(properties.bulletPoints ?? []).map((bulletPoint) => translate(bulletPoint))}
      className={className}
      defaultOpen={defaultOpen}
    />
  );
};

export default Optional;

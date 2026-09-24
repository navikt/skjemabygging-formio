import { Heading } from '@navikt/ds-react';
import { IntroPageSection, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import IntroBulletPoints from './IntroBulletPoints';
import IntroDescription from './IntroDescription';

interface Props {
  properties?: IntroPageSection;
  translate: TranslateFunction;
  className?: string;
  headingLevel: '2' | '3';
  headingSize: 'large' | 'medium';
}

const IntroSection = ({ properties, translate, className, headingLevel, headingSize }: Props) => {
  if (!properties?.title) {
    return null;
  }

  return (
    <div className={className}>
      <Heading level={headingLevel} size={headingSize} spacing>
        {translate(properties.title)}
      </Heading>
      <IntroDescription description={translate(properties.description)} />
      <IntroBulletPoints values={(properties.bulletPoints ?? []).map((bulletPoint) => translate(bulletPoint))} />
    </div>
  );
};

export type { Props as IntroSectionProps };
export default IntroSection;

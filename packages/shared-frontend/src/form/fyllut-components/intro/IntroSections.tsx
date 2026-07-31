import { Heading } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import { IntroBulletPoints, IntroDescription } from './IntroShared';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: string) => string;
  className?: string;
}

const Section = ({
  properties,
  translate,
  className,
  headingLevel,
  headingSize,
}: Props & { headingLevel: '2' | '3'; headingSize: 'large' | 'medium' }) => {
  if (!properties?.title) {
    return null;
  }

  return (
    <div className={className}>
      <Heading level={headingLevel} size={headingSize} spacing>
        {translate(properties.title)}
      </Heading>
      <IntroDescription description={translate(properties.description)} />
      <IntroBulletPoints values={(properties.bulletPoints ?? []).map(translate)} />
    </div>
  );
};

const Scope = (props: Props) => <Section {...props} headingLevel="2" headingSize="large" />;
const OutOfScope = (props: Props) => <Section {...props} headingLevel="3" headingSize="medium" />;
const Prerequisites = (props: Props) => <Section {...props} headingLevel="2" headingSize="large" />;

export { OutOfScope, Prerequisites, Scope };

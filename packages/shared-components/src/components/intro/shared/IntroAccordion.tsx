import { Accordion } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import IntroBulletPoints from './IntroBulletPoints';
import IntroDescription from './IntroDescription';

interface Props {
  properties?: IntroPageSection;
  className?: string;
}

const IntroAccordion = ({ properties, className }: Props) => {
  if (!properties?.title) {
    return null;
  }

  return (
    <Accordion.Item className={className}>
      <Accordion.Header>{properties.title}</Accordion.Header>
      <Accordion.Content>
        <IntroDescription properties={properties} />
        <IntroBulletPoints properties={properties} />
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default IntroAccordion;

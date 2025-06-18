import { Accordion } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../context/languages';
import IntroBulletPoints from './IntroBulletPoints';
import IntroDescription from './IntroDescription';

interface Props {
  properties?: IntroPageSection;
  className?: string;
}

const IntroAccordion = ({ properties, className }: Props) => {
  const { translate } = useLanguages();
  if (!properties?.title) {
    return null;
  }

  return (
    <Accordion.Item className={className}>
      <Accordion.Header>{translate(properties.title)}</Accordion.Header>
      <Accordion.Content>
        <IntroDescription properties={properties} />
        <IntroBulletPoints properties={properties} />
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default IntroAccordion;

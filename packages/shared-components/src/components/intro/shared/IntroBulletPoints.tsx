import { BodyShort, List } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  properties?: IntroPageSection;
}

const Section = ({ properties }: Props) => {
  if (!properties?.bulletPoints) {
    return null;
  }

  return (
    <List>
      {properties.bulletPoints.map((item, index) => (
        <List.Item key={index}>
          <BodyShort>{item}</BodyShort>
        </List.Item>
      ))}
    </List>
  );
};

export default Section;

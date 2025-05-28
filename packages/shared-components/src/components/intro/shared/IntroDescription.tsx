import { BodyLong } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  properties?: IntroPageSection;
}

const IntroDescription = ({ properties }: Props) => {
  if (!properties?.description) {
    return null;
  }

  return <BodyLong spacing>{properties.description}</BodyLong>;
};

export default IntroDescription;

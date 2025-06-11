import { BodyLong } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../context/languages';
import { InnerHtml } from '../../../index';

interface Props {
  properties?: IntroPageSection;
}

const IntroDescription = ({ properties }: Props) => {
  const { translate } = useLanguages();
  if (!properties?.description) {
    return null;
  }

  return (
    <BodyLong spacing>
      <InnerHtml content={translate(properties.description)} />
    </BodyLong>
  );
};

export default IntroDescription;

import { BodyShort, Heading, VStack } from '@navikt/ds-react';
import { SendinnEntry, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { useLanguage } from '../context/language/LanguageContext';

type Journey = Exclude<SendinnEntry['journey'], 'unavailable'>;

interface Props {
  journey: Journey;
}

// Temporary page that names the resolved journey. Later slices replace it with the journey itself.
const JourneyPlaceholder = ({ journey }: Props) => {
  const { translate } = useLanguage();
  const title = translate(TEXTS.statiske.sendinn.journey[journey]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <VStack gap="space-16" data-journey={journey}>
      <Heading level="1" size="large">
        {title}
      </Heading>
      <BodyShort>{translate(TEXTS.statiske.sendinn.comingSoon)}</BodyShort>
    </VStack>
  );
};

export { JourneyPlaceholder };

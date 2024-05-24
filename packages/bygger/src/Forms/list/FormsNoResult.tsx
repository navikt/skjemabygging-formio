import { BodyShort, Heading, VStack } from '@navikt/ds-react';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';

const FormsNoResult = () => {
  const { config } = useAppConfig();

  return (
    <>
      <Heading size="large" level="1">
        Feil ved henting av skjemaer
      </Heading>

      <VStack gap="5">
        <BodyShort size="medium">
          Det oppsto en feil ved henting av skjemaer. Prøv og trykk oppdater i nettleseren eller prøv igjen senere.
        </BodyShort>

        {config?.isDevelopment && (
          <div>
            <Heading size="medium" level="2">
              Lokalt utviklingsmiljø
            </Heading>

            <BodyShort size="medium">Sjekk at du er koblet til naisdevice og at status på Kolide er ok.</BodyShort>
          </div>
        )}
      </VStack>
    </>
  );
};

export default FormsNoResult;

import { BodyShort, Heading, VStack } from '@navikt/ds-react';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';

export type FormErrorType = 'FORMS_ERROR' | 'FORM_ERROR' | 'FORM_NOT_FOUND';

interface Props {
  type: FormErrorType;
}

const FormErrorBody = ({ type }: Props) => {
  const { config } = useAppConfig();

  const getTitle = () => {
    switch (type) {
      case 'FORM_ERROR':
        return 'Feil ved henting av skjema';
      case 'FORM_NOT_FOUND':
        return 'Skjema ikke funnet';
      case 'FORMS_ERROR':
        return 'Feil ved henting av skjemaer';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'FORM_ERROR':
        return 'Det oppsto en feil ved henting av skjema. Prøv og trykk oppdater i nettleseren eller prøv igjen senere.';
      case 'FORM_NOT_FOUND':
        return 'Skjemaet du prøvde å åpne eksisterer ikke.';
      case 'FORMS_ERROR':
        return 'Det oppsto en feil ved henting av skjemaer. Prøv og trykk oppdater i nettleseren eller prøv igjen senere.';
    }
  };

  return (
    <>
      <Heading size="large" level="1">
        {getTitle()}
      </Heading>

      <VStack gap="space-20">
        <BodyShort size="medium">{getDescription()}</BodyShort>

        {config?.isDevelopment && ['FORM_ERROR', 'FORMS_ERROR'].includes(type) && (
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

export default FormErrorBody;

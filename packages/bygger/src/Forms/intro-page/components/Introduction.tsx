import { Box, Heading } from '@navikt/ds-react';
import { SectionWrapper } from './SectionWrapper';
import { TexareaField } from './TexareaField';

export function Introduction() {
  const onChange = (value: string) => {
    console.log(value);
  };

  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Velkomstmelding
          </Heading>
          <TexareaField
            label="Velkomstmelding som hjelper bruker forstå at de bruker riktig skjema"
            description="Teksten skal være en kort, overordnet veiledning til søkeren som gir en komprimert forklaring av
              pengestøtten, tiltaket eller hjelpemiddelet. Denne teksten hentes fra ingressen til produktsiden på
              nav.no. Avslutt med en lenke til produktsiden, med selvforklarende lenketekst (lenken åpner i ny fane)."
            onChange={(value) => onChange(value)}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

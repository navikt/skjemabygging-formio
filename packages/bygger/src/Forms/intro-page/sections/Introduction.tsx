import { Box, Heading } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { TextareaField } from '../components/TextareaField';
import { SectionWrapper } from './SectionWrapper';

export function Introduction({ handleChange, form }: { handleChange: UpdateFormFunction; form: Form }) {
  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Velkomstmelding
          </Heading>
          <TextareaField
            value={form?.introPage?.introduction}
            label="Velkomstmelding som hjelper bruker forstå at de bruker riktig skjema"
            description="Teksten skal være en kort, overordnet veiledning til søkeren som gir en komprimert forklaring av
              pengestøtten, tiltaket eller hjelpemiddelet. Denne teksten hentes fra ingressen til produktsiden på
              nav.no. Avslutt med en lenke til produktsiden, med selvforklarende lenketekst (lenken åpner i ny fane)."
            onChange={(value) => {
              if (!form?.introPage) return;

              handleChange({
                ...form,
                introPage: {
                  ...form.introPage,
                  introduction: value,
                },
              });
            }}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

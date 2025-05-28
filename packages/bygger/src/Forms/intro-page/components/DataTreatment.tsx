import { Box, Heading } from '@navikt/ds-react';
import { SectionWrapper } from './SectionWrapper';

export function DataTreatment() {
  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Hvordan vi behandler personopplysninger
          </Heading>
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

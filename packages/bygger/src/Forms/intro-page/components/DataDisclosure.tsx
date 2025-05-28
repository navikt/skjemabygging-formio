import { Box, Heading } from '@navikt/ds-react';
import { SectionWrapper } from './SectionWrapper';

export function DataDisclosure() {
  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Informasjon vi henter
          </Heading>
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

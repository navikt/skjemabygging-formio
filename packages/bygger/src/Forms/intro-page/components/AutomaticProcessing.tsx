import { Box, Heading } from '@navikt/ds-react';
import { SectionWrapper } from './SectionWrapper';

export function AutomaticProcessing() {
  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Automatisk saksbehandling
          </Heading>
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

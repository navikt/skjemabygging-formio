import { Box, Heading } from '@navikt/ds-react';
import { SectionWrapper } from './SectionWrapper';

export function OptionalElement() {
  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Valgfritt element
          </Heading>
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

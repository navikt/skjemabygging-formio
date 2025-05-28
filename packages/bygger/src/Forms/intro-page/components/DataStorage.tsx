import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { SectionWrapper } from './SectionWrapper';

export function DataStorage() {
  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Erklæring
          </Heading>
          <RadioGroup legend="Velg overskrift">
            <Radio value="scope1">behandle henvendelsen din</Radio>
            <Radio value="scope2">behandle søknaden din</Radio>
            <Radio value="scope3">behandle saken din</Radio>
            <Radio value="scope3">behandle meldingen din</Radio>
          </RadioGroup>
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

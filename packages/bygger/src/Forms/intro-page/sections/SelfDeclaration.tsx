import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { SectionWrapper } from './SectionWrapper';

export function SelfDeclaration({ handleChange, form }: { handleChange: UpdateFormFunction; form: Form }) {
  return (
    <SectionWrapper
      noBorderBottom={true}
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Erklæring
          </Heading>
          <RadioGroup
            legend="Velg overskrift"
            value={form.introPage?.selfDeclaration || ''}
            onChange={(value) => {
              if (!form?.introPage) return;
              handleChange({
                ...form,
                introPage: {
                  ...form.introPage,
                  selfDeclaration: value,
                },
              });
            }}
          >
            <Radio value="scope1">behandle henvendelsen din</Radio>
            <Radio value="scope2">behandle søknaden din</Radio>
            <Radio value="scope3">behandle saken din</Radio>
            <Radio value="scope4">behandle meldingen din</Radio>
          </RadioGroup>
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

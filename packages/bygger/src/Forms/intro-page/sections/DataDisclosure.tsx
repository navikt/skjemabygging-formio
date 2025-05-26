import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../components/AddButton';
import { TextareaField } from '../components/TextareaField';
import { addBulletPoint, handleBulletPointChange, removeBulletPoint, updateSection } from '../intro-page-utils';
import { SectionWrapper } from './SectionWrapper';

export function DataDisclosure({ form, handleChange }: { form: Form; handleChange: UpdateFormFunction }) {
  const bulletPoints = form.introPage?.sections?.dataDisclosure?.bulletPoints || [];

  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Informasjon vi henter
          </Heading>
          <RadioGroup
            legend="Velg overskrift"
            defaultValue={form?.introPage?.sections.dataDisclosure?.title}
            onChange={(value) => handleChange(updateSection(form, 'dataDisclosure', 'title', value))}
          >
            <Radio value="scope1">Informasjon vi henter om deg</Radio>
            <Radio value="scope2">Informasjon vi henter</Radio>
          </RadioGroup>
          {bulletPoints?.map((bullet, index) => (
            <TextareaField
              key={index}
              label="Kulepunkt"
              value={bullet}
              onChange={(value) => handleChange(handleBulletPointChange(form, 'dataDisclosure', index, value))}
              showDeleteButton
              onDelete={() => handleChange(removeBulletPoint(form, 'dataDisclosure', index))}
            />
          ))}
          <AddButton
            label={'Legg til kulepunkt'}
            variant="tertiary"
            onClick={() => handleChange(addBulletPoint(form, 'dataDisclosure', ''))}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

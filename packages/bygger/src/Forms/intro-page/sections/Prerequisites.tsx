import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../components/AddButton';
import { TextareaField } from '../components/TextareaField';
import { addBulletPoint, handleBulletPointChange, removeBulletPoint, updateSection } from '../intro-page-utils';
import { SectionWrapper } from './SectionWrapper';

export function Prerequisites({ form, handleChange }: { form: Form; handleChange: UpdateFormFunction }) {
  const showIngress = form.introPage?.sections?.prerequisites?.description !== undefined;

  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Informasjon om utfylling av skjemaet
          </Heading>
          <RadioGroup
            legend="Velg overskrift"
            defaultValue={form.introPage?.sections?.prerequisites?.title}
            onChange={(value) => handleChange(updateSection(form, 'prerequisites', 'title', value))}
          >
            <Radio value="scope1">Før du søker</Radio>
            <Radio value="scope2">Før du svarer</Radio>
            <Radio value="scope3">Før du fyller ut</Radio>
          </RadioGroup>
          <Box>
            {!showIngress && (
              <AddButton
                label={'Legg til ingress'}
                onClick={() => handleChange(updateSection(form, 'prerequisites', 'description', ''))}
              />
            )}

            {showIngress && (
              <TextareaField
                label="Ingress"
                onChange={(value) => handleChange(updateSection(form, 'prerequisites', 'description', value))}
                showDeleteButton
                onDelete={() => {
                  handleChange(updateSection(form, 'prerequisites', 'description', undefined));
                }}
              />
            )}
          </Box>
          {form.introPage?.sections?.prerequisites?.bulletPoints?.map((bullet, index) => (
            <TextareaField
              key={index}
              label="Kulepunkt"
              value={bullet}
              onChange={(value) => handleChange(handleBulletPointChange(form, 'prerequisites', index, value))}
              showDeleteButton
              onDelete={() => handleChange(removeBulletPoint(form, 'prerequisites', index))}
            />
          ))}
          <AddButton
            label={'Legg til kulepunkt'}
            variant="tertiary"
            onClick={() => handleChange(addBulletPoint(form, 'prerequisites', ''))}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

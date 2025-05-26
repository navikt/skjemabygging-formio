import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { Fragment } from 'react';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../components/AddButton';
import { TextareaField } from '../components/TextareaField';
import { addBulletPoint, handleBulletPointChange, removeBulletPoint, updateSection } from '../intro-page-utils';
import { SectionWrapper } from './SectionWrapper';

export function OutOfScope({ form, handleChange }: { form: Form; handleChange: UpdateFormFunction }) {
  const showIngress = form?.introPage?.sections?.outOfScope?.description !== undefined;
  const bulletPoints = form.introPage?.sections?.outOfScope?.bulletPoints || [];
  const showAddBulletList = bulletPoints.length === 0;

  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Avklar hva skjemaet IKKE skal brukes til
          </Heading>
          <RadioGroup
            legend="Velg overskrift"
            defaultValue={form?.introPage?.sections?.outOfScope?.title || ''}
            onChange={(value) => handleChange(updateSection(form, 'outOfScope', 'title', value))}
          >
            <Radio value="introPage.outOfScope.title.alt1">Dette kan du ikke søke om her</Radio>
            <Radio value="introPage.outOfScope.title.alt2">Dette kan du ikke gjøre her</Radio>
            <Radio value="introPage.outOfScope.title.alt3">Her kan du ikke</Radio>
          </RadioGroup>
          <Box>
            {!showIngress && (
              <AddButton
                label={'Legg til ingress'}
                onClick={() => handleChange(addBulletPoint(form, 'outOfScope', ''))}
              />
            )}
            {showAddBulletList && (
              <AddButton
                label={'Legg til punktliste'}
                onClick={() => handleChange(addBulletPoint(form, 'outOfScope', ''))}
              />
            )}
            {showIngress && (
              <TextareaField
                value={form?.introPage?.sections?.outOfScope?.description || ''}
                label="Ingress"
                onChange={(value) => handleChange(updateSection(form, 'outOfScope', 'description', value))}
                showDeleteButton
                onDelete={() => {
                  handleChange(updateSection(form, 'outOfScope', 'description', undefined));
                }}
              />
            )}
          </Box>

          {!!form.introPage?.sections?.outOfScope?.bulletPoints?.length && (
            <>
              {form.introPage?.sections?.outOfScope?.bulletPoints?.map((bullet, index) => (
                <Fragment key={index}>
                  <TextareaField
                    value={bullet}
                    label="Kulepunkt"
                    onChange={(value) => handleChange(handleBulletPointChange(form, 'outOfScope', index, value))}
                    showDeleteButton
                    onDelete={() => handleChange(removeBulletPoint(form, 'outOfScope', index))}
                  />
                </Fragment>
              ))}
              <AddButton
                label={'Legg til kulepunkt'}
                variant="tertiary"
                onClick={() => handleChange(addBulletPoint(form, 'outOfScope', ''))}
              />
            </>
          )}
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

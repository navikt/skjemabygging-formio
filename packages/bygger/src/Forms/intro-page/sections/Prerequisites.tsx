import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../components/AddButton';
import { FieldsetErrorMessage } from '../components/FieldsetErrorMessage';
import { TextareaField } from '../components/TextareaField';
import { addBulletPoint, handleBulletPointChange, removeBulletPoint, updateSection } from '../utils';
import { IntroPageRefs } from '../validation/useIntroPageRefs';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  form: Form;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: IntroPageRefs;
};

export function Prerequisites({ form, handleChange, errors, refMap }: Props) {
  const showIngress = form.introPage?.sections?.prerequisites?.description !== undefined;

  return (
    <SectionWrapper
      data-testid="prerequisites"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Informasjon om utfylling av skjemaet
          </Heading>
          <RadioGroup
            legend="Velg overskrift"
            defaultValue={form.introPage?.sections?.prerequisites?.title}
            onChange={(value) => handleChange(updateSection(form, 'prerequisites', 'title', value))}
            error={errors?.sections?.prerequisites?.title}
          >
            <Radio value="introPage.prerequisites.title.alt1" ref={refMap['sections.prerequisites.title']}>
              Før du søker
            </Radio>
            <Radio value="introPage.prerequisites.title.alt2">Før du svarer</Radio>
            <Radio value="introPage.prerequisites.title.alt3">Før du fyller ut</Radio>
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
                value={form.introPage?.sections?.prerequisites?.description}
                label="Ingress"
                onChange={(value) => handleChange(updateSection(form, 'prerequisites', 'description', value))}
                showDeleteButton
                onDelete={() => {
                  handleChange(updateSection(form, 'prerequisites', 'description', undefined));
                }}
                error={errors?.sections?.prerequisites?.description}
                ref={refMap['sections.prerequisites.description']}
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
              error={errors?.sections?.prerequisites?.bulletPoints?.[index]}
              ref={refMap['sections.prerequisites.bulletPoints'][index]}
            />
          ))}
          <AddButton
            label={'Legg til kulepunkt'}
            variant="tertiary"
            onClick={() => handleChange(addBulletPoint(form, 'prerequisites', ''))}
          />
          <FieldsetErrorMessage
            errorMessage={errors?.sections?.prerequisites?.message}
            ref={refMap['sections.prerequisites.message']}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

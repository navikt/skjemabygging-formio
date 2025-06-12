import { Box, Heading } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../components/AddButton';
import { SectionErrorMessage } from '../components/SectionErrorMessage';
import { TextareaField } from '../components/TextareaField';
import { TextFieldComponent } from '../components/TextFieldComponent';
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

export function Optional({ handleChange, form, errors, refMap }: Props) {
  const bulletPoints = form?.introPage?.sections?.optional?.bulletPoints || [];
  const showIngress = form?.introPage?.sections.optional?.description !== undefined;
  const showAddBulletList = bulletPoints.length === 0;

  return (
    <SectionWrapper
      data-testid="optional"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Valgfritt element
          </Heading>
          <TextFieldComponent
            label="Overskrift"
            value={form?.introPage?.sections.optional?.title || ''}
            ref={refMap['sections.optional.title']}
            onChange={(value) => handleChange(updateSection(form, 'optional', 'title', value))}
            error={errors?.sections?.optional?.title}
          />
          {!showIngress && (
            <AddButton
              label="Legg til ingress"
              onClick={() => handleChange(updateSection(form, 'optional', 'description', ''))}
            />
          )}
          {showAddBulletList && (
            <AddButton
              label={'Legg til punktliste'}
              onClick={() => handleChange(addBulletPoint(form, 'optional', ''))}
            />
          )}
          {showIngress && (
            <TextareaField
              label="Ingress"
              value={form?.introPage?.sections.optional?.description || ''}
              onChange={(value) => handleChange(updateSection(form, 'optional', 'description', value))}
              showDeleteButton
              onDelete={() => {
                handleChange(updateSection(form, 'optional', 'description', undefined));
              }}
              error={errors?.sections?.optional?.description}
              ref={refMap['sections.optional.description']}
            />
          )}
          {!!form.introPage?.sections?.optional?.bulletPoints?.length && (
            <>
              {bulletPoints.map((bullet, index) => (
                <TextareaField
                  key={index}
                  label="Kulepunkt"
                  value={bullet}
                  onChange={(value) => handleChange(handleBulletPointChange(form, 'optional', index, value))}
                  showDeleteButton
                  onDelete={() => handleChange(removeBulletPoint(form, 'optional', index))}
                  error={errors?.sections?.optional?.bulletPoints?.[index]}
                  ref={refMap['sections.optional.bulletPoints'][index]}
                />
              ))}
              <AddButton
                label="Legg til kulepunkt"
                onClick={() => handleChange(addBulletPoint(form, 'optional', ''))}
              />
            </>
          )}
          <SectionErrorMessage errorMessage={errors?.sections?.optional?.message} />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

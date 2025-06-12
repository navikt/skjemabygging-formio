import { Box, Heading } from '@navikt/ds-react';
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

export function AutomaticProcessing({ form, handleChange, errors, refMap }: Props) {
  const { introPage } = form;
  const showIngress = form.introPage?.sections?.automaticProcessing?.description !== undefined;
  const bulletPoints = introPage?.sections?.automaticProcessing?.bulletPoints || [];
  const showAddBulletList = bulletPoints.length === 0;

  return (
    <SectionWrapper
      data-testid="automaticProcessing"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Automatisk saksbehandling
          </Heading>
          {!introPage?.sections?.automaticProcessing?.description && (
            <AddButton
              label="Legg til ingress"
              onClick={() => handleChange(updateSection(form, 'automaticProcessing', 'description', ''))}
            />
          )}

          {showAddBulletList && (
            <AddButton
              label={'Legg til punktliste'}
              onClick={() => handleChange(addBulletPoint(form, 'automaticProcessing', ''))}
            />
          )}
          {showIngress && (
            <TextareaField
              label="Ingress"
              value={introPage?.sections?.automaticProcessing?.description || ''}
              onChange={(value) => handleChange(updateSection(form, 'automaticProcessing', 'description', value))}
              showDeleteButton
              onDelete={() => {
                handleChange(updateSection(form, 'automaticProcessing', 'description', undefined));
              }}
              error={errors?.sections?.automaticProcessing?.description}
              ref={refMap['sections.automaticProcessing.description']}
            />
          )}
          {!!form.introPage?.sections?.automaticProcessing?.bulletPoints?.length && (
            <>
              {bulletPoints.map((value, index) => (
                <TextareaField
                  key={index}
                  label="Kulepunkt"
                  value={value}
                  onChange={(value) => handleChange(handleBulletPointChange(form, 'automaticProcessing', index, value))}
                  showDeleteButton
                  onDelete={() => handleChange(removeBulletPoint(form, 'automaticProcessing', index))}
                  error={errors?.sections?.automaticProcessing?.bulletPoints?.[index]}
                  ref={refMap['sections.automaticProcessing.bulletPoints'][index]}
                />
              ))}
              <AddButton
                label="Legg til kulepunkt"
                variant="tertiary"
                onClick={() => handleChange(addBulletPoint(form, 'automaticProcessing', ''))}
              />
            </>
          )}
          <FieldsetErrorMessage
            errorMessage={errors?.sections?.automaticProcessing?.message}
            ref={refMap['sections.automaticProcessing.message']}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

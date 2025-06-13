import { Box, Heading } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../components/AddButton';
import { FieldsetErrorMessage } from '../components/FieldsetErrorMessage';
import { TextareaField } from '../components/TextareaField';
import { addBulletPoint, handleBulletPointChange, removeBulletPoint, updateSection } from '../utils/utils';
import { IntroPageRefs } from '../validation/useIntroPageRefs';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  form: Form;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: IntroPageRefs;
};

export function DataTreatment({ form, handleChange, errors, refMap }: Props) {
  const showIngress = form.introPage?.sections?.dataTreatment?.description !== undefined;
  const bulletPoints = form.introPage?.sections?.dataTreatment?.bulletPoints || [];
  const showAddBulletList = bulletPoints.length === 0;
  const { introPage } = form;

  return (
    <SectionWrapper
      data-testid="dataTreatment"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Hvordan vi behandler personopplysninger
          </Heading>
          {!showIngress && (
            <AddButton
              label="Legg til ingress"
              onClick={() => handleChange(updateSection(form, 'dataTreatment', 'description', ''))}
            />
          )}
          {showAddBulletList && (
            <AddButton
              label={'Legg til punktliste'}
              onClick={() => handleChange(addBulletPoint(form, 'dataTreatment', ''))}
            />
          )}
          {showIngress && (
            <TextareaField
              label="Ingress"
              value={introPage?.sections?.dataTreatment?.description || ''}
              onChange={(value) => handleChange(updateSection(form, 'dataTreatment', 'description', value))}
              showDeleteButton
              onDelete={() => {
                handleChange(updateSection(form, 'dataTreatment', 'description', undefined));
              }}
              error={errors?.sections?.dataTreatment?.description}
              ref={refMap['sections.dataTreatment.description']}
            />
          )}

          {!!form.introPage?.sections?.dataTreatment?.bulletPoints?.length && (
            <>
              {bulletPoints.map((value, index) => {
                return (
                  <TextareaField
                    key={index}
                    label="Kulepunkt"
                    value={value}
                    onChange={(value) => handleChange(handleBulletPointChange(form, 'dataTreatment', index, value))}
                    showDeleteButton
                    onDelete={() => handleChange(removeBulletPoint(form, 'dataTreatment', index))}
                    error={errors?.sections?.dataTreatment?.bulletPoints?.[index]}
                    ref={refMap['sections.dataTreatment.bulletPoints'][index]}
                  />
                );
              })}
              <AddButton
                label="Legg til kulepunkt"
                variant="tertiary"
                onClick={() => handleChange(addBulletPoint(form, 'dataTreatment', ''))}
              />
            </>
          )}
          <FieldsetErrorMessage
            errorMessage={errors?.sections?.dataTreatment?.message}
            ref={refMap['sections.dataTreatment.message']}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

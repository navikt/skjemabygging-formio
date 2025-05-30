import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../AddButton';
import { TextareaField } from '../TextareaField';
import { SectionWrapper } from './SectionWrapper';

export function Prerequisites({ form, handleChange }: { form: Form; handleChange: UpdateFormFunction }) {
  const addBulletPoint = () => {
    const updatedBulletPoints = [...(form.introPage?.sections?.prerequisites?.bulletPoints || []), ''];
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          prerequisites: {
            ...form.introPage.sections?.prerequisites,
            bulletPoints: updatedBulletPoints,
          },
        },
      },
    });
  };

  const updateBulletPoint = (index: number, value: string) => {
    const updatedBulletPoints = [...(form.introPage?.sections?.prerequisites?.bulletPoints || [])];
    updatedBulletPoints[index] = value;
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          prerequisites: {
            ...form.introPage.sections?.prerequisites,
            bulletPoints: updatedBulletPoints,
          },
        },
      },
    });
  };

  const deleteBulletPoint = (index: number) => {
    const updatedBulletPoints = [...(form.introPage?.sections?.prerequisites?.bulletPoints || [])];
    updatedBulletPoints.splice(index, 1);
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          prerequisites: {
            ...form.introPage.sections?.prerequisites,
            bulletPoints: updatedBulletPoints,
          },
        },
      },
    });
  };

  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Informasjon om utfylling av skjemaet
          </Heading>
          <RadioGroup legend="Velg overskrift" defaultValue={form.introPage?.sections?.prerequisites?.title}>
            <Radio value="scope1">Før du søker</Radio>
            <Radio value="scope2">Før du svarer</Radio>
            <Radio value="scope3">Før du fyller ut</Radio>
          </RadioGroup>
          <Box>
            {form.introPage?.sections?.prerequisites?.description === undefined && (
              <AddButton
                label={'Legg til ingress'}
                onClick={() =>
                  handleChange({
                    ...form,
                    introPage: {
                      ...form.introPage,
                      sections: {
                        ...form.introPage.sections,
                        prerequisites: {
                          ...form.introPage.sections?.prerequisites,
                          description: '',
                        },
                      },
                    },
                  })
                }
              />
            )}
            <TextareaField
              label="Ingress"
              onChange={(value) =>
                handleChange({
                  ...form,
                  introPage: {
                    ...form.introPage,
                    sections: {
                      ...form.introPage.sections,
                      prerequisites: {
                        ...form.introPage?.sections?.prerequisites,
                        description: value,
                      },
                    },
                  },
                })
              }
              onDelete={() =>
                handleChange({
                  ...form,
                  introPage: {
                    ...form.introPage,
                    sections: {
                      ...form.introPage.sections,
                      prerequisites: {
                        ...form.introPage?.sections?.prerequisites,
                      },
                    },
                  },
                })
              }
              showDeleteButton={!!form.introPage?.sections?.prerequisites?.description}
              hidden={!form.introPage?.sections?.prerequisites}
            />
          </Box>
          {form.introPage?.sections?.prerequisites?.bulletPoints?.map((bullet, index) => (
            <TextareaField
              key={index}
              label={`Kulepunkt ${index + 1}`}
              value={bullet}
              onChange={(value) => updateBulletPoint(index, value)}
              showDeleteButton
              onDelete={() => deleteBulletPoint(index)}
            />
          ))}
          <AddButton label={'Legg til kulepunkt'} variant="tertiary" onClick={addBulletPoint} />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

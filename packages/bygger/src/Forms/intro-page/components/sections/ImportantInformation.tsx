import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { UpdateFormFunction } from '../../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../AddButton';
import { TexareaField } from '../TexareaField';
import { SectionWrapper } from './SectionWrapper';

export function ImportantInformation({ form, handleChange }: { form: Form; handleChange: UpdateFormFunction }) {
  const [showIngress, setShowIngress] = useState(!!form.introPage?.sections?.importantInformation?.description);

  const addBulletPoint = () => {
    const updatedBulletPoints = [...(form.introPage?.sections?.importantInformation?.bulletPoints || []), ''];
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          importantInformation: {
            ...form.introPage.sections?.importantInformation,
            bulletPoints: updatedBulletPoints,
          },
        },
      },
    });
  };

  const updateBulletPoint = (index: number, value: string) => {
    const updatedBulletPoints = [...(form.introPage?.sections?.importantInformation?.bulletPoints || [])];
    updatedBulletPoints[index] = value;
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          importantInformation: {
            ...form.introPage.sections?.importantInformation,
            bulletPoints: updatedBulletPoints,
          },
        },
      },
    });
  };

  const deleteBulletPoint = (index: number) => {
    const updatedBulletPoints = [...(form.introPage?.sections?.importantInformation?.bulletPoints || [])];
    updatedBulletPoints.splice(index, 1);
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          importantInformation: {
            ...form.introPage.sections?.importantInformation,
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
            Viktig informasjon
          </Heading>
          <RadioGroup legend="Velg overskrift" defaultValue={form.introPage?.sections?.importantInformation?.title}>
            <Radio value="importantInformation.title.alt1">Viktig å vite</Radio>
            <Radio value="importantInformation.title.alt2">Husk dette</Radio>
          </RadioGroup>
          <Box>
            {!showIngress && (
              <AddButton
                label={'Legg til ingress'}
                variant="secondary"
                size="small"
                onClick={() => setShowIngress(true)}
              />
            )}
            {showIngress && (
              <TexareaField
                value={form.introPage.sections.importantInformation?.description || ''}
                label="Ingress"
                onChange={(value) =>
                  handleChange({
                    ...form,
                    introPage: {
                      ...form.introPage,
                      sections: {
                        ...form.introPage.sections,
                        importantInformation: {
                          ...form.introPage.sections?.importantInformation,
                          description: value,
                        },
                      },
                    },
                  })
                }
                showDeleteButton
                onDelete={() => {
                  setShowIngress(false);
                  handleChange({
                    ...form,
                    introPage: {
                      ...form.introPage,
                      sections: {
                        ...form.introPage.sections,
                        importantInformation: {
                          ...form.introPage.sections?.importantInformation,
                          description: undefined,
                        },
                      },
                    },
                  });
                }}
              />
            )}
          </Box>
          {(form.introPage?.sections?.importantInformation?.bulletPoints || []).map((bullet, index) => (
            <TexareaField
              key={index}
              value={bullet}
              label={`Kulepunkt ${index + 1}`}
              onChange={(value) => updateBulletPoint(index, value)}
              showDeleteButton
              onDelete={() => deleteBulletPoint(index)}
            />
          ))}
          <AddButton variant="tertiary" onClick={addBulletPoint} label={'Legg til kulepunkt'} />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

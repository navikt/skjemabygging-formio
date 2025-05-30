import { Box, Heading } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { UpdateFormFunction } from '../../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../AddButton';
import { TextareaField } from '../TextareaField';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  form: Form;
  handleChange: UpdateFormFunction;
};

export function AutomaticProcessing({ form, handleChange }: Props) {
  const [showIngress, setShowIngress] = useState(!!form.introPage?.sections?.automaticProcessing?.description);
  const [bulletPoints, setBulletPoints] = useState(form.introPage?.sections?.automaticProcessing?.bulletPoints || []);

  const handleIngressChange = (value: string) => {
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          automaticProcessing: {
            ...form.introPage.sections?.automaticProcessing,
            description: value,
          },
        },
      },
    });
  };

  const addIngress = () => {
    setShowIngress(true);
  };

  const addBulletPoint = () => {
    const updatedBulletPoints = [...bulletPoints, ''];
    setBulletPoints(updatedBulletPoints);
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          automaticProcessing: {
            ...form.introPage.sections?.automaticProcessing,
            bulletPoints: updatedBulletPoints,
          },
        },
      },
    });
  };

  const handleBulletPointChange = (index: number, value: string) => {
    const updatedBulletPoints = [...bulletPoints];
    updatedBulletPoints[index] = value;
    setBulletPoints(updatedBulletPoints);
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          automaticProcessing: {
            ...form.introPage.sections?.automaticProcessing,
            bulletPoints: updatedBulletPoints,
          },
        },
      },
    });
  };

  const deleteBulletPoint = (index: number) => {
    const updatedBulletPoints = [...bulletPoints];
    updatedBulletPoints.splice(index, 1);
    setBulletPoints(updatedBulletPoints);
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          automaticProcessing: {
            ...form.introPage.sections?.automaticProcessing,
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
            Automatisk saksbehandling
          </Heading>
          {!showIngress && <AddButton label="Legg til ingress" onClick={addIngress} />}
          {showIngress && (
            <TextareaField
              label="Ingress"
              value={form.introPage.sections.automaticProcessing?.description || ''}
              onChange={handleIngressChange}
              showDeleteButton
              onDelete={() => {
                setShowIngress(false);
                handleChange({
                  ...form,
                  introPage: {
                    ...form.introPage,
                    sections: {
                      ...form.introPage.sections,
                      automaticProcessing: {
                        ...form.introPage.sections?.automaticProcessing,
                        description: undefined,
                      },
                    },
                  },
                });
              }}
            />
          )}
          {bulletPoints.map((bullet, index) => (
            <TextareaField
              key={index}
              label={`Kulepunkt ${index + 1}`}
              value={bullet}
              onChange={(value) => handleBulletPointChange(index, value)}
              showDeleteButton
              onDelete={() => deleteBulletPoint(index)}
            />
          ))}
          <AddButton label="Legg til kulepunkt" onClick={addBulletPoint} />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

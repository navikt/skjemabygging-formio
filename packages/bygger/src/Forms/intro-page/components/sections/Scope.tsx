import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { Fragment, useState } from 'react';
import { UpdateFormFunction } from '../../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../AddButton';
import { TextareaField } from '../TextareaField';
import { SectionWrapper } from './SectionWrapper';

export function Scope({ form, handleChange }: { form: Form; handleChange: UpdateFormFunction }) {
  const [showIngress, setShowIngress] = useState(!!form.introPage?.sections?.scope?.description);

  const addBulletPoint = () => {
    const updatedBulletPoints = [...(form.introPage?.sections?.scope?.bulletPoints || []), ''];
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          scope: {
            ...form.introPage.sections?.scope,
            bulletPoints: updatedBulletPoints,
          },
        },
      },
    });
  };

  const updateBulletPoint = (index: number, value: string) => {
    const updatedBulletPoints = [...(form.introPage?.sections?.scope?.bulletPoints || [])];
    updatedBulletPoints[index] = value;
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          scope: {
            ...form.introPage.sections?.scope,
            bulletPoints: updatedBulletPoints,
          },
        },
      },
    });
  };

  const deleteBulletPoint = (index: number) => {
    const updatedBulletPoints = [...(form.introPage?.sections?.scope?.bulletPoints || [])];
    updatedBulletPoints.splice(index, 1);
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          scope: {
            ...form.introPage.sections?.scope,
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
            Beskriv hva skjemaet kan brukes til
          </Heading>
          <RadioGroup legend="Velg overskrift" defaultValue={form.introPage?.sections?.scope?.title}>
            <Radio value="scope.title.alt1">Her kan du søke om</Radio>
            <Radio value="scope.title.alt2">Her kan du melde om</Radio>
            <Radio value="scope.title.alt3">Her kan du</Radio>
          </RadioGroup>
          <Box>
            {!showIngress && (
              <AddButton label={'Legg til ingress'} variant="secondary" onClick={() => setShowIngress(true)} />
            )}
            {!form.introPage.sections.scope?.bulletPoints?.length && (
              <AddButton label={'Legg til Punktliste'} variant="secondary" onClick={addBulletPoint} />
            )}
            {showIngress && (
              <TextareaField
                value={form.introPage.sections.scope?.description || ''}
                label="Ingress"
                onChange={(value) =>
                  handleChange({
                    ...form,
                    introPage: {
                      ...form.introPage,
                      sections: {
                        ...form.introPage.sections,
                        scope: {
                          ...form.introPage.sections?.scope,
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
                        scope: {
                          ...form.introPage.sections?.scope,
                          description: undefined,
                        },
                      },
                    },
                  });
                }}
              />
            )}
          </Box>

          {!!form.introPage?.sections?.scope?.bulletPoints?.length && (
            <>
              {form.introPage?.sections?.scope?.bulletPoints?.map((bullet, index) => (
                <Fragment key={index}>
                  <TextareaField
                    value={bullet}
                    label="Kulepunkt"
                    onChange={(value) => updateBulletPoint(index, value)}
                    showDeleteButton
                    onDelete={() => deleteBulletPoint(index)}
                  />
                </Fragment>
              ))}
              <AddButton label={'Legg til kulepunkt'} variant="tertiary" onClick={addBulletPoint} />
            </>
          )}
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

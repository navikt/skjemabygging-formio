import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { UpdateFormFunction } from '../../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../AddButton';
import { TexareaField } from '../TexareaField';
import { SectionWrapper } from './SectionWrapper';

const useStyles = makeStyles({
  buttonGroupVertical: {
    display: 'flex',
    flexDirection: 'column',
  },
  buttonGroupHorizontal: {
    display: 'flex',
    flexDirection: 'row',
  },
});

export function OutOfScope({ form, handleChange }: { form: Form; handleChange: UpdateFormFunction }) {
  const styles = useStyles();

  const [showIngress, setShowIngress] = useState(false);
  const [showBodyText, setShowBodyText] = useState(false);

  const addBulletPoint = () => {
    const updatedBulletPoints = [...(form.introPage?.sections?.outOfScope?.bulletPoints || []), ''];
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          outOfScope: {
            ...form.introPage.sections?.outOfScope,
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
            Avklar hva skjemaet IKKE skal brukes til
          </Heading>
          <RadioGroup legend="Velg overskrift" defaultValue={form.introPage.sections.outOfScope?.title}>
            <Radio value="introPage.outOfScope.title.alt1"> Her kan du søke om</Radio>
            <Radio value="introPage.outOfScope.title.alt2">Her kan du melde om</Radio>
            <Radio value="introPage.outOfScope.title.alt3">Her kan du</Radio>
          </RadioGroup>
          <Box>
            <div className={!showIngress || !showBodyText ? styles.buttonGroupHorizontal : styles.buttonGroupVertical}>
              <AddButton label={'Legg til ingress'} onClick={addBulletPoint} />
              <AddButton label={'Legg til punktliste'} onClick={addBulletPoint} />
            </div>

            <TexareaField
              label="Ingress"
              onChange={() => setShowIngress(!showIngress)}
              hidden={!showIngress}
              showDeleteButton={showIngress}
              onDelete={() => setShowIngress(false)}
            />

            <TexareaField
              label="Kulepunkt"
              onChange={() => setShowBodyText(!showBodyText)}
              hidden={!showBodyText}
              showDeleteButton={showBodyText}
              onDelete={() => setShowBodyText(false)}
            />
            <AddButton label={'Legg til kulepunkt'} variant="tertiary" onClick={addBulletPoint} />
          </Box>
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

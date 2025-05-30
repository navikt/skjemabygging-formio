import { Box, Heading, TextField } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { UpdateFormFunction } from '../../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../AddButton';
import { SectionWrapper } from './SectionWrapper';

const useStyles = makeStyles({
  textfield: {
    padding: 'var(--a-space-12) var(--a-space-32) 0 0',
  },
});

export function OptionalElement({ handleChange, form }: { handleChange: UpdateFormFunction; form: Form }) {
  const styles = useStyles();
  const [showIngress, setShowIngress] = useState(false);
  const [showBulletList, setShowBulletList] = useState(false);
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
  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Valgfritt element
          </Heading>
          <TextField
            label="Overskrift"
            defaultValue={form.introPage.sections.optional?.title}
            className={styles.textfield}
            onChange={(e) =>
              handleChange({
                ...form,
                introPage: {
                  ...form.introPage,
                  sections: {
                    ...form.introPage.sections,
                    optional: {
                      ...form.introPage.sections?.optional,
                      title: e.target.value,
                    },
                  },
                },
              })
            }
          />
          <AddButton label={'Legg til ingress'} onClick={() => setShowIngress(!showIngress)} />
          <AddButton label={'Legg til punktliste'} onClick={() => setShowBulletList(!showBulletList)} />
          <AddButton label={'Legg til kulepunkt'} variant="tertiary" onClick={addBulletPoint} />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

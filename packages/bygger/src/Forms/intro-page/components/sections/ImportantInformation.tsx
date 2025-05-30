import { Box, Heading, TextField } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../AddButton';
import { TextareaField } from '../TextareaField';
import { SectionWrapper } from './SectionWrapper';

const useStyles = makeStyles({
  textField: {
    padding: 'var(--a-space-12) var(--a-space-32) 0 0',
  },
});

export function ImportantInformation({ form, handleChange }: { form: Form; handleChange: UpdateFormFunction }) {
  const styles = useStyles();

  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Viktig informasjon
          </Heading>
          {!form.introPage?.sections?.importantInformation?.title && (
            <AddButton
              label="Legg til overskrift"
              onClick={() =>
                handleChange({
                  ...form,
                  introPage: {
                    ...form.introPage,
                    sections: {
                      ...form.introPage.sections,
                      importantInformation: {
                        ...form.introPage.sections?.importantInformation,
                        title: '',
                      },
                    },
                  },
                })
              }
            />
          )}
          {form.introPage.sections.importantInformation?.title !== undefined && (
            <TextField
              label="Overskrift"
              className={styles.textField}
              onChange={(event) =>
                handleChange({
                  ...form,
                  introPage: {
                    ...form.introPage,
                    sections: {
                      ...form.introPage.sections,
                      importantInformation: {
                        ...form.introPage.sections?.importantInformation,
                        title: event.target.value,
                      },
                    },
                  },
                })
              }
            />
          )}
          <TextareaField
            label="Brødtekst"
            description="Beskrivelse"
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
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

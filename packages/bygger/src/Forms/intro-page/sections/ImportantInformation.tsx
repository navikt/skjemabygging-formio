import { Box, Heading } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../components/AddButton';
import { TextareaField } from '../components/TextareaField';
import { TextFieldComponent } from '../components/TextFieldComponent';
import {
  deleteImportantInformationKey,
  initializeImportantInformation,
  updateImportantInformation,
} from '../intro-page-utils';
import { SectionWrapper } from './SectionWrapper';

export function ImportantInformation({ form, handleChange }: { form: Form; handleChange: UpdateFormFunction }) {
  const { introPage } = form;
  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Viktig informasjon
          </Heading>
          {introPage?.importantInformation?.title === undefined && (
            <AddButton
              label="Legg til overskrift"
              onClick={() => handleChange(initializeImportantInformation(form, 'title', ''))}
            />
          )}
          {introPage?.importantInformation?.title !== undefined && (
            <TextFieldComponent
              label="Overskrift"
              onChange={(value) => handleChange(initializeImportantInformation(form, 'title', value))}
              showDeleteButton={true}
              onDelete={() => handleChange(deleteImportantInformationKey(form, 'title'))}
            />
          )}
          <TextareaField
            label="Brødtekst"
            onChange={(value) => handleChange(updateImportantInformation(form, 'description', value))}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

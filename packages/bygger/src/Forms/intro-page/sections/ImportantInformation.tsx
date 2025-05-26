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
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  form: Form;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: any;
};

export function ImportantInformation({ form, handleChange, errors, refMap }: Props) {
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
              value={form.introPage?.importantInformation?.title}
              onChange={(value) => handleChange(initializeImportantInformation(form, 'title', value))}
              showDeleteButton={true}
              onDelete={() => handleChange(deleteImportantInformationKey(form, 'title'))}
              error={errors?.importantInformation?.title}
              ref={refMap['importantInformation.title']}
            />
          )}
          <TextareaField
            label="Brødtekst"
            value={form.introPage?.importantInformation?.description}
            onChange={(value) => handleChange(updateImportantInformation(form, 'description', value))}
            error={errors?.importantInformation?.description}
            ref={refMap['importantInformation.description']}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

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
} from '../utils/utils';
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
  const hasTitle = introPage?.importantInformation?.title !== undefined;
  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Viktig informasjon
          </Heading>
          {!hasTitle && (
            <AddButton
              label="Legg til overskrift"
              onClick={() => initializeImportantInformation(form, 'title', '', handleChange)}
            />
          )}
          {hasTitle && (
            <TextFieldComponent
              label="Overskrift"
              value={form.introPage?.importantInformation?.title}
              onChange={(value) => initializeImportantInformation(form, 'title', value, handleChange)}
              showDeleteButton
              onDelete={() => deleteImportantInformationKey(form, 'title', handleChange)}
              error={errors?.importantInformation?.title}
              ref={refMap['importantInformation.title']}
            />
          )}
          <TextareaField
            label="Brødtekst"
            value={form.introPage?.importantInformation?.description}
            onChange={(value) => updateImportantInformation(form, 'description', value, handleChange)}
            error={errors?.importantInformation?.description}
            ref={refMap['importantInformation.description']}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

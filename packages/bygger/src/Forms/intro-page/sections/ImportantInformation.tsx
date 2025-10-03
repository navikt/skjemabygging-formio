import { Box, Heading } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { AddButton } from '../components/AddButton';
import { FormIntroPageWysiwygEditor } from '../components/FormIntroPageWysiwygEditor';
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
  const { setKeyBasedText, getKeyBasedText } = useKeyBasedText();
  const { introPage } = form;
  const hasTitle = introPage?.importantInformation?.title !== undefined;

  const onChange = (value: string, property: 'title' | 'description') => {
    const key = setKeyBasedText(value, property);
    updateImportantInformation(form, property, key, handleChange);
  };

  return (
    <SectionWrapper
      data-testid="importantInformation"
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
              defaultValue={getKeyBasedText(form.introPage?.importantInformation?.title)}
              onChange={(value) => onChange(value, 'title')}
              showDeleteButton
              onDelete={() => deleteImportantInformationKey(form, 'title', handleChange)}
              error={errors?.importantInformation?.title}
              ref={refMap['importantInformation.title']}
            />
          )}
          <FormIntroPageWysiwygEditor
            label="Brødtekst"
            defaultValue={getKeyBasedText(form.introPage?.importantInformation?.description)}
            onChange={(value) => onChange(value, 'description')}
            error={errors?.importantInformation?.description}
            ref={refMap['importantInformation.description']}
          />
        </Box>
      }
      right={
        <Intro.ImportantInformation
          title={form.introPage?.importantInformation?.title}
          description={form.introPage?.importantInformation?.description}
          translate={getKeyBasedText}
        />
      }
    />
  );
}

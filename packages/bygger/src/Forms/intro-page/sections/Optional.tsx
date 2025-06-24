import { Accordion, Box, Heading } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { FieldsetErrorMessage } from '../components/FieldsetErrorMessage';
import { IngressBulletPointRow } from '../components/IngressBulletPointRow';
import { TextFieldComponent } from '../components/TextFieldComponent';
import { updateSection } from '../utils/utils';
import { IntroPageRefs } from '../validation/useIntroPageRefs';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  form: Form;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: IntroPageRefs;
};

export function Optional({ handleChange, form, errors, refMap }: Props) {
  const { setKeyBasedText, getKeyBasedText } = useKeyBasedText();

  const bulletPoints = form?.introPage?.sections?.optional?.bulletPoints || [];
  const showIngress = form?.introPage?.sections.optional?.description !== undefined;
  const showAddBulletList = bulletPoints.length === 0;

  const onTitleChange = (value: string) => {
    const key = setKeyBasedText(value);
    updateSection(form, 'optional', 'title', key, handleChange);
  };

  return (
    <SectionWrapper
      data-testid="optional"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Valgfritt element
          </Heading>
          <TextFieldComponent
            label="Overskrift"
            defaultValue={getKeyBasedText(form?.introPage?.sections.optional?.title) || ''}
            ref={refMap['sections.optional.title']}
            onChange={onTitleChange}
            error={errors?.sections?.optional?.title}
          />
          <IngressBulletPointRow
            field="optional"
            form={form}
            handleChange={handleChange}
            errors={errors}
            refMap={refMap}
            bulletPoints={bulletPoints}
            showAddBulletList={showAddBulletList}
            showField={showIngress}
          />
          <FieldsetErrorMessage
            errorMessage={errors?.sections?.optional?.message}
            ref={refMap['sections.optional.message']}
          />
        </Box>
      }
      right={
        <Accordion>
          <Intro.Optional properties={form.introPage?.sections?.optional} translate={getKeyBasedText} />
        </Accordion>
      }
    />
  );
}

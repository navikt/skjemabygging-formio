import { Box, Heading } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import { Form, IntroPage } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef } from 'react';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import WysiwygEditor from '../../../components/wysiwyg/WysiwygEditor';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  handleChange: UpdateFormFunction;
  form: Form;
  errors?: IntroPageError;
};

export const Introduction = forwardRef<HTMLDivElement, Props>(({ handleChange, form, errors }, ref) => {
  const { setKeyBasedText, getKeyBasedText } = useKeyBasedText();

  const onChange = (value: string) => {
    const key = setKeyBasedText(value.toString());
    if (form.introPage?.introduction === key) {
      return; // No change needed
    }

    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        introduction: key,
      } as IntroPage,
    });
  };

  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Velkomstmelding
          </Heading>
          <WysiwygEditor
            onChange={onChange}
            defaultValue={getKeyBasedText(form?.introPage?.introduction)}
            ref={ref}
            error={errors?.introduction}
          />
        </Box>
      }
      right={<Intro.GuidePanel description={form.introPage?.introduction} translate={getKeyBasedText} />}
    />
  );
});

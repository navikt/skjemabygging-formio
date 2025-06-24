import { Box, Heading } from '@navikt/ds-react';
import { Form, IntroPage } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef } from 'react';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { TextareaField } from '../components/TextareaField';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  handleChange: UpdateFormFunction;
  form: Form;
  errors?: IntroPageError;
};

export const Introduction = forwardRef<HTMLTextAreaElement, Props>(({ handleChange, form, errors }, ref) => {
  const { setKeyBasedText, getKeyBasedText } = useKeyBasedText();

  const onChange = (value: string) => {
    const key = setKeyBasedText(value);
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
          <TextareaField
            defaultValue={getKeyBasedText(form?.introPage?.introduction)}
            ref={ref}
            label="Velkomstmelding som hjelper bruker forstå at de bruker riktig skjema"
            description="Teksten skal være en kort, overordnet veiledning til søkeren som gir en komprimert forklaring av
                pengestøtten, tiltaket eller hjelpemiddelet. Denne teksten hentes fra ingressen til produktsiden på
                nav.no. Avslutt med en lenke til produktsiden, med selvforklarende lenketekst (lenken åpner i ny fane)."
            error={errors?.introduction}
            onChange={onChange}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
});

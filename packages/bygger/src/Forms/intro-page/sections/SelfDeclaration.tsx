import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef } from 'react';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  form: Form;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
};

export const SelfDeclaration = forwardRef<HTMLInputElement, Props>(({ handleChange, form, errors }, ref) => {
  return (
    <SectionWrapper
      noBorderBottom={true}
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Erklæring
          </Heading>
          <RadioGroup
            legend="Velg overskrift"
            value={form.introPage?.selfDeclaration || ''}
            onChange={(value) => {
              if (!form?.introPage) return;
              handleChange({
                ...form,
                introPage: {
                  ...form.introPage,
                  selfDeclaration: value,
                },
              });
            }}
            error={errors?.selfDeclaration}
          >
            <Radio value="introPage.selfDeclaration.description.alt1" ref={ref}>
              behandle henvendelsen din
            </Radio>
            <Radio value="introPage.selfDeclaration.description.alt2">behandle søknaden din</Radio>
            <Radio value="introPage.selfDeclaration.description.alt3">behandle saken din</Radio>
            <Radio value="introPage.selfDeclaration.description.alt4">behandle meldingen din</Radio>
          </RadioGroup>
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
});

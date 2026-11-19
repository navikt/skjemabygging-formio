import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import { Form, introPageTexts } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef } from 'react';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  form: Form;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
};

export const SelfDeclaration = forwardRef<HTMLInputElement, Props>(({ handleChange, form, errors }, ref) => {
  const { getKeyBasedText } = useKeyBasedText();

  return (
    <SectionWrapper
      noBorderBottom={true}
      left={
        <Box paddingInline="space-0 space-48">
          <Heading level="3" size="small" spacing>
            Erklæring
          </Heading>
          <RadioGroup
            legend="Velg formulering"
            description="Velg formulering som skal fullføre setningen: “Det er viktig at du gir oss riktige opplysninger slik at vi kan ...”"
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
            <Radio value={introPageTexts.selfDeclaration.descriptions[0]} ref={ref}>
              behandle henvendelsen din
            </Radio>
            <Radio value={introPageTexts.selfDeclaration.descriptions[1]}>behandle søknaden din</Radio>
            <Radio value={introPageTexts.selfDeclaration.descriptions[2]}>behandle saken din</Radio>
            <Radio value={introPageTexts.selfDeclaration.descriptions[3]}>behandle meldingen din</Radio>
          </RadioGroup>
        </Box>
      }
      right={<Intro.SelfDeclaration description={form.introPage?.selfDeclaration ?? ''} translate={getKeyBasedText} />}
    />
  );
});

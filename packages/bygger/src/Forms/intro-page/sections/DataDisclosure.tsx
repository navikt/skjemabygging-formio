import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../components/AddButton';
import { TextareaField } from '../components/TextareaField';
import { addBulletPoint, handleBulletPointChange, removeBulletPoint, updateSection } from '../utils';
import { IntroPageRefs } from '../validation/useIntroPageRefs';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  form: Form;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: IntroPageRefs;
};

export function DataDisclosure({ form, handleChange, refMap, errors }: Props) {
  const bulletPoints = form.introPage?.sections?.dataDisclosure?.bulletPoints || [];

  return (
    <SectionWrapper
      data-testid="dataDisclosure"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Informasjon vi henter
          </Heading>
          <RadioGroup
            legend="Velg overskrift"
            defaultValue={form?.introPage?.sections.dataDisclosure?.title}
            onChange={(value) => handleChange(updateSection(form, 'dataDisclosure', 'title', value))}
            error={errors?.sections?.dataDisclosure?.title}
          >
            <Radio value="introPage.dataDisclosure.title.alt1" ref={refMap['sections.dataDisclosure.title']}>
              Informasjon vi henter om deg
            </Radio>
            <Radio value="introPage.dataDisclosure.title.alt2">Informasjon vi henter</Radio>
          </RadioGroup>
          {bulletPoints?.map((bullet, index) => (
            <TextareaField
              key={index}
              label="Kulepunkt"
              value={bullet}
              onChange={(value) => handleChange(handleBulletPointChange(form, 'dataDisclosure', index, value))}
              showDeleteButton
              onDelete={() => handleChange(removeBulletPoint(form, 'dataDisclosure', index))}
              error={errors?.sections?.dataDisclosure?.bulletPoints?.[index]}
              ref={refMap['sections.dataDisclosure.bulletPoints'][index]}
            />
          ))}
          <AddButton
            label={'Legg til kulepunkt'}
            variant="tertiary"
            onClick={() => handleChange(addBulletPoint(form, 'dataDisclosure', ''))}
          />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

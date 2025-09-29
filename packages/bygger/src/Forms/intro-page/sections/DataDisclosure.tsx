import { Accordion, Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { AddButton } from '../components/AddButton';
import { FormIntroPageWysiwygEditor } from '../components/FormIntroPageWysiwygEditor';
import { addBulletPoint, handleBulletPointChange, removeBulletPoint, updateSection } from '../utils/utils';
import { IntroPageRefs } from '../validation/useIntroPageRefs';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';
import { usePreviewStyles } from './styles';

type Props = {
  form: Form;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: IntroPageRefs;
};

export function DataDisclosure({ form, handleChange, refMap, errors }: Props) {
  const { setKeyBasedText, getKeyBasedText } = useKeyBasedText();
  const previewStyles = usePreviewStyles();
  const bulletPoints = form.introPage?.sections?.dataDisclosure?.bulletPoints || [];

  const onBulletPointChange = (value: string, index: number) => {
    const key = setKeyBasedText(value, `bulletpoint-${index}`);
    handleBulletPointChange(form, 'dataDisclosure', index, key, handleChange);
  };

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
            onChange={(value) => updateSection(form, 'dataDisclosure', 'title', value, handleChange)}
            error={errors?.sections?.dataDisclosure?.title}
          >
            <Radio value="introPage.dataDisclosure.title.alt1" ref={refMap['sections.dataDisclosure.title']}>
              Informasjon vi henter om deg
            </Radio>
            <Radio value="introPage.dataDisclosure.title.alt2">Informasjon vi henter</Radio>
          </RadioGroup>
          {bulletPoints?.map((bullet, index) => (
            <FormIntroPageWysiwygEditor
              key={index}
              label="Kulepunkt"
              defaultValue={getKeyBasedText(bullet)}
              onChange={(value) => onBulletPointChange(value, index)}
              showDeleteButton
              onDelete={() => removeBulletPoint(form, 'dataDisclosure', index, handleChange)}
              error={errors?.sections?.dataDisclosure?.bulletPoints?.[index]}
              ref={refMap['sections.dataDisclosure.bulletPoints'][index]}
            />
          ))}
          <AddButton
            label={'Legg til kulepunkt'}
            variant="tertiary"
            onClick={() => addBulletPoint(form, 'dataDisclosure', '', handleChange)}
          />
        </Box>
      }
      right={
        <Accordion className={previewStyles.accordion}>
          <Intro.DataDisclosure
            properties={form.introPage?.sections?.dataDisclosure}
            translate={getKeyBasedText}
            defaultOpen
          />
        </Accordion>
      }
    />
  );
}

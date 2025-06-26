import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import { Form, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { FieldsetErrorMessage } from '../components/FieldsetErrorMessage';
import { IngressBulletPointRow } from '../components/IngressBulletPointRow';
import { updateSection } from '../utils/utils';
import { IntroPageRefs } from '../validation/useIntroPageRefs';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  form: Form;
  submissionMethod: SubmissionMethod;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: IntroPageRefs;
};

export function Prerequisites({ form, submissionMethod, handleChange, errors, refMap }: Props) {
  const { getKeyBasedText } = useKeyBasedText();
  const showIngress = form.introPage?.sections?.prerequisites?.description !== undefined;
  const bulletPoints = form.introPage?.sections?.prerequisites?.bulletPoints || [];

  return (
    <SectionWrapper
      data-testid="prerequisites"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Informasjon om utfylling av skjemaet
          </Heading>
          <RadioGroup
            legend="Velg overskrift"
            defaultValue={form.introPage?.sections?.prerequisites?.title}
            onChange={(value) => updateSection(form, 'prerequisites', 'title', value, handleChange)}
            error={errors?.sections?.prerequisites?.title}
          >
            <Radio value="introPage.prerequisites.title.alt1" ref={refMap['sections.prerequisites.title']}>
              Før du søker
            </Radio>
            <Radio value="introPage.prerequisites.title.alt2">Før du svarer</Radio>
            <Radio value="introPage.prerequisites.title.alt3">Før du fyller ut</Radio>
          </RadioGroup>
          <Box>
            <IngressBulletPointRow
              field="prerequisites"
              form={form}
              handleChange={handleChange}
              errors={errors}
              refMap={refMap}
              bulletPoints={bulletPoints}
              showAddBulletList
              showField={showIngress}
            />
            <FieldsetErrorMessage
              errorMessage={errors?.sections?.prerequisites?.message}
              ref={refMap['sections.prerequisites.message']}
            />
          </Box>
        </Box>
      }
      right={
        <Intro.Prerequisites
          properties={form.introPage?.sections?.prerequisites}
          translate={getKeyBasedText}
          submissionMethod={submissionMethod}
        />
      }
    />
  );
}

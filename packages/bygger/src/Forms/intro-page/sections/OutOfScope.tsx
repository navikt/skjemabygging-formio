import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { FieldsetErrorMessage } from '../components/FieldsetErrorMessage';
import { IngressBulletPointRow } from '../components/IngressBulletPointRow';
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

export function OutOfScope({ form, handleChange, errors, refMap }: Props) {
  const showIngress = form?.introPage?.sections?.outOfScope?.description !== undefined;
  const bulletPoints = form.introPage?.sections?.outOfScope?.bulletPoints || [];
  const showAddBulletList = bulletPoints.length === 0;

  return (
    <SectionWrapper
      data-testid="out-of-scope"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Avklar hva skjemaet IKKE skal brukes til
          </Heading>
          <RadioGroup
            legend="Velg overskrift"
            defaultValue={form?.introPage?.sections?.outOfScope?.title || ''}
            onChange={(value) => updateSection(form, 'outOfScope', 'title', value, handleChange)}
            error={errors?.sections?.outOfScope?.title}
          >
            <Radio value="introPage.outOfScope.title.alt1" ref={refMap['sections.outOfScope.title']}>
              Dette kan du ikke søke om her
            </Radio>
            <Radio value="introPage.outOfScope.title.alt2">Dette kan du ikke gjøre her</Radio>
            <Radio value="introPage.outOfScope.title.alt3">Her kan du ikke</Radio>
          </RadioGroup>
          <Box>
            <IngressBulletPointRow
              field="outOfScope"
              form={form}
              handleChange={handleChange}
              errors={errors}
              refMap={refMap}
              bulletPoints={bulletPoints}
              showAddBulletList={showAddBulletList}
              showField={showIngress}
            />
            <FieldsetErrorMessage
              errorMessage={errors?.sections?.outOfScope?.message}
              ref={refMap['sections.outOfScope.message']}
            />
          </Box>
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

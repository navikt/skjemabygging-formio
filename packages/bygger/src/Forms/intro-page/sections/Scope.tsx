import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
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
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: IntroPageRefs;
};

export function Scope({ form, handleChange, errors, refMap }: Props) {
  const { getKeyBasedText } = useKeyBasedText();
  const showIngress = form.introPage?.sections?.scope?.description !== undefined;
  const bulletPoints = form.introPage?.sections?.scope?.bulletPoints || [];
  const showAddBulletList = bulletPoints.length === 0;

  return (
    <SectionWrapper
      data-testid="scope"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Beskriv hva skjemaet kan brukes til
          </Heading>
          <RadioGroup
            legend="Velg overskrift"
            defaultValue={form.introPage?.sections?.scope?.title}
            onChange={(value) => updateSection(form, 'scope', 'title', value, handleChange)}
            error={errors?.sections?.scope?.title}
          >
            <Radio value="introPage.scope.title.alt1" ref={refMap['sections.scope.title']}>
              Her kan du søke om
            </Radio>
            <Radio value="introPage.scope.title.alt2">Her kan du melde om</Radio>
            <Radio value="introPage.scope.title.alt3">Her kan du</Radio>
          </RadioGroup>
          <IngressBulletPointRow
            field="scope"
            form={form}
            handleChange={handleChange}
            errors={errors}
            refMap={refMap}
            bulletPoints={bulletPoints}
            showAddBulletList={showAddBulletList}
            showField={showIngress}
          />
          <FieldsetErrorMessage
            errorMessage={errors?.sections?.scope?.message}
            ref={refMap['sections.scope.message']}
          />
        </Box>
      }
      right={<Intro.Scope properties={form.introPage?.sections?.scope} translate={getKeyBasedText} />}
    />
  );
}

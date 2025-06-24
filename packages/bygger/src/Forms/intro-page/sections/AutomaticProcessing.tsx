import { Accordion, Box, Heading } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { FieldsetErrorMessage } from '../components/FieldsetErrorMessage';
import { IngressBulletPointRow } from '../components/IngressBulletPointRow';
import { IntroPageRefs } from '../validation/useIntroPageRefs';
import { IntroPageError } from '../validation/validation';
import { SectionWrapper } from './SectionWrapper';

type Props = {
  form: Form;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: IntroPageRefs;
};

export function AutomaticProcessing({ form, handleChange, errors, refMap }: Props) {
  const { getKeyBasedText } = useKeyBasedText();
  const { introPage } = form;
  const { automaticProcessing } = introPage?.sections || {};
  const showIngress = form.introPage?.sections?.automaticProcessing?.description !== undefined;
  const bulletPoints = introPage?.sections?.automaticProcessing?.bulletPoints || [];
  const showAddBulletList = bulletPoints.length === 0;

  return (
    <SectionWrapper
      data-testid="automaticProcessing"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Automatisk saksbehandling
          </Heading>
          <IngressBulletPointRow
            field="automaticProcessing"
            form={form}
            handleChange={handleChange}
            errors={errors}
            refMap={refMap}
            bulletPoints={automaticProcessing?.bulletPoints || []}
            showAddBulletList={showAddBulletList}
            showField={showIngress}
          />
          <FieldsetErrorMessage
            errorMessage={errors?.sections?.automaticProcessing?.message}
            ref={refMap['sections.automaticProcessing.message']}
          />
        </Box>
      }
      right={
        <Accordion>
          <Intro.AutomaticProcessing properties={automaticProcessing} translate={getKeyBasedText} />
        </Accordion>
      }
    />
  );
}

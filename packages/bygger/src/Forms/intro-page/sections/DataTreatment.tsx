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

export function DataTreatment({ form, handleChange, errors, refMap }: Props) {
  const { getKeyBasedText } = useKeyBasedText();
  const showIngress = form.introPage?.sections?.dataTreatment?.description !== undefined;
  const bulletPoints = form.introPage?.sections?.dataTreatment?.bulletPoints || [];
  const showAddBulletList = bulletPoints.length === 0;

  return (
    <SectionWrapper
      data-testid="dataTreatment"
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Hvordan vi behandler personopplysninger
          </Heading>
          <IngressBulletPointRow
            field="dataTreatment"
            form={form}
            handleChange={handleChange}
            errors={errors}
            refMap={refMap}
            bulletPoints={bulletPoints}
            showAddBulletList={showAddBulletList}
            showField={showIngress}
          />
          <FieldsetErrorMessage
            errorMessage={errors?.sections?.dataTreatment?.message}
            ref={refMap['sections.dataTreatment.message']}
          />
        </Box>
      }
      right={
        <Accordion>
          <Intro.DataTreatment
            properties={form.introPage?.sections?.dataTreatment}
            translate={getKeyBasedText}
            defaultOpen
          />
        </Accordion>
      }
    />
  );
}

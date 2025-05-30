import { Box, Heading } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../AddButton';
import { SectionWrapper } from './SectionWrapper';

export function DataTreatment({ form, handleChange }: { form: Form; handleChange: UpdateFormFunction }) {
  const addBulletPoint = () => {
    const updatedBulletPoints = [...(form.introPage?.sections?.importantInformation?.bulletPoints || []), ''];
    handleChange({
      ...form,
      introPage: {
        ...form.introPage,
        sections: {
          ...form.introPage.sections,
          importantInformation: {
            ...form.introPage.sections?.importantInformation,
            bulletPoints: updatedBulletPoints,
          },
        },
      },
    });
  };
  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Hvordan vi behandler personopplysninger
          </Heading>
          <AddButton label={'Legg til ingress'} onClick={addBulletPoint} />
          <AddButton label={'Legg til punktliste'} onClick={addBulletPoint} />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

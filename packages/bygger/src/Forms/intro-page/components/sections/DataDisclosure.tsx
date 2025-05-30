import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { UpdateFormFunction } from '../../../../components/FormMetaDataEditor/utils/utils';
import { AddButton } from '../AddButton';
import { TexareaField } from '../TexareaField';
import { SectionWrapper } from './SectionWrapper';

export function DataDisclosure({ form, handleChange }: { form: Form; handleChange: UpdateFormFunction }) {
  const [showBulletList, setShowBulletList] = useState(false);

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
            Informasjon vi henter
          </Heading>
          <RadioGroup legend="Velg overskrift" defaultValue={form.introPage.sections.dataDisclosure?.title}>
            <Radio value="scope1">Informasjon vi henter om deg</Radio>
            <Radio value="scope2">Informasjon vi henter</Radio>
          </RadioGroup>
          <TexareaField
            label="Kulepunkt"
            onChange={() => setShowBulletList(!showBulletList)}
            hidden={!showBulletList}
            showDeleteButton={showBulletList}
            onDelete={() => setShowBulletList(false)}
          />
          <AddButton label={'Legg til kulepunkt'} variant="tertiary" onClick={() => addBulletPoint()} />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}

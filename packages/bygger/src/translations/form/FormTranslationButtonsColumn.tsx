import { Button, VStack } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import UserFeedback from '../../components/UserFeedback';
import { useEditFormTranslations } from '../../context/translations/EditFormTranslationsContext';
import ExportFormTranslationsButton from '../components/ExportFormTranslationsButton';

interface Props {
  form: Form;
}

const FormTranslationButtonsColumn = ({ form }: Props) => {
  const [isSaving, setIsSaving] = useState(false);
  const { saveChanges } = useEditFormTranslations();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveChanges();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VStack gap="4">
      <Button loading={isSaving} onClick={handleSave} type="submit" size="small">
        Lagre
      </Button>
      <ExportFormTranslationsButton form={form} />
      <UserFeedback />
    </VStack>
  );
};
export default FormTranslationButtonsColumn;

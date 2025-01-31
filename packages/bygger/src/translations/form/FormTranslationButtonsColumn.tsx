import { Button, VStack } from '@navikt/ds-react';
import { useState } from 'react';
import UserFeedback from '../../components/UserFeedback';
import { useEditFormTranslations } from '../../context/translations/EditFormTranslationsContext';

const FormTranslationButtonsColumn = () => {
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
      <Button loading={isSaving} onClick={handleSave} type="button" size="small">
        Lagre
      </Button>
      <Button variant="tertiary" disabled={isSaving} onClick={() => {}} type="button" size="small">
        Eksporter
      </Button>
      <UserFeedback />
    </VStack>
  );
};
export default FormTranslationButtonsColumn;

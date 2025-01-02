import { Button, VStack } from '@navikt/ds-react';
import { useState } from 'react';
import UserFeedback from '../../components/UserFeedback';
import { useEditGlobalTranslations } from '../../context/translations/EditGlobalTranslationsContext';

const GlobalTranslationButtonsColumn = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { saveChanges } = useEditGlobalTranslations();

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
      <Button variant="secondary" disabled={isSaving} onClick={() => {}} type="button" size="small">
        Publisér
      </Button>
      <Button variant="tertiary" disabled={isSaving} onClick={() => {}} type="button" size="small">
        Eksporter
      </Button>
      <UserFeedback />
    </VStack>
  );
};
export default GlobalTranslationButtonsColumn;

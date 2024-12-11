import { Button, VStack } from '@navikt/ds-react';
import { useState } from 'react';
import UserFeedback from '../../components/UserFeedback';
import { useEditTranslations } from '../../context/translations/EditTranslationsContext';

const TranslationButtonColumn = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { saveChanges } = useEditTranslations();

  const onSave = async () => {
    setIsSaving(true);
    await saveChanges();
    setIsSaving(false);
  };

  return (
    <VStack gap="4">
      <Button loading={isSaving} onClick={onSave} type="button" size="small">
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
export default TranslationButtonColumn;

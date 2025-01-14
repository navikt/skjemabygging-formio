import { Button, VStack } from '@navikt/ds-react';
import { useState } from 'react';
import UserFeedback from '../../components/UserFeedback';
import { useEditGlobalTranslations } from '../../context/translations/EditGlobalTranslationsContext';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import ExportGlobalTranslationsButton from '../components/ExportGlobalTranslationsButton';

const GlobalTranslationButtonsColumn = () => {
  const [isProcessing, setIsProcessing] = useState<'SAVING' | 'PUBLISHING'>();
  const { saveChanges } = useEditGlobalTranslations();
  const { publish, loadTranslations } = useGlobalTranslations();

  const handleSave = async () => {
    try {
      setIsProcessing('SAVING');
      await saveChanges();
    } finally {
      setIsProcessing(undefined);
    }
  };

  const handlePublish = async () => {
    try {
      setIsProcessing('PUBLISHING');
      await publish();
      await loadTranslations();
    } finally {
      setIsProcessing(undefined);
    }
  };

  return (
    <VStack gap="4">
      <Button
        loading={isProcessing === 'SAVING'}
        disabled={isProcessing === 'PUBLISHING'}
        onClick={handleSave}
        type="button"
        size="small"
      >
        Lagre
      </Button>
      <Button
        variant="secondary"
        loading={isProcessing === 'PUBLISHING'}
        disabled={isProcessing === 'SAVING'}
        onClick={handlePublish}
        type="button"
        size="small"
      >
        Publisér
      </Button>
      <ExportGlobalTranslationsButton language={'nn'}>{'Eksporter nynorsk'}</ExportGlobalTranslationsButton>
      <ExportGlobalTranslationsButton language={'en'}>{'Eksporter engelsk'}</ExportGlobalTranslationsButton>
      <UserFeedback />
    </VStack>
  );
};
export default GlobalTranslationButtonsColumn;

import { Button, VStack } from '@navikt/ds-react';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';
import UserFeedback from '../../components/UserFeedback';
import { useEditGlobalTranslations } from '../../context/translations/EditGlobalTranslationsContext';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import ExportGlobalTranslationsButton from '../components/ExportGlobalTranslationsButton';

const GlobalTranslationButtonsColumn = () => {
  const [isProcessing, setIsProcessing] = useState<'SAVING' | 'PUBLISHING' | 'IMPORTING'>();
  const { saveChanges, importFromProduction } = useEditGlobalTranslations();
  const { publish } = useGlobalTranslations();
  const { config } = useAppConfig();

  const handleSave = async () => {
    try {
      setIsProcessing('SAVING');
      await saveChanges();
    } finally {
      setIsProcessing(undefined);
    }
  };

  const handlePublish = async () => {
    setIsProcessing('PUBLISHING');
    await publish();
    setIsProcessing(undefined);
  };

  const handleImport = async () => {
    setIsProcessing('IMPORTING');
    await importFromProduction();
    setIsProcessing(undefined);
  };

  return (
    <VStack gap="space-4">
      <Button
        loading={isProcessing === 'SAVING'}
        disabled={!!isProcessing}
        onClick={handleSave}
        type="submit"
        size="small"
      >
        Lagre
      </Button>
      <Button
        variant="secondary"
        loading={isProcessing === 'PUBLISHING'}
        disabled={!!isProcessing}
        onClick={handlePublish}
        type="button"
        size="small"
      >
        Publisér
      </Button>
      <ExportGlobalTranslationsButton />
      {!config?.isProdGcp && (
        <Button
          variant="tertiary"
          loading={isProcessing === 'IMPORTING'}
          disabled={!!isProcessing}
          onClick={handleImport}
          type="button"
          size="small"
        >
          Kopier fra produksjon
        </Button>
      )}
      <UserFeedback />
    </VStack>
  );
};
export default GlobalTranslationButtonsColumn;

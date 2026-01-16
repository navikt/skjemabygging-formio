import { Button, VStack } from '@navikt/ds-react';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import UserFeedback from '../../components/UserFeedback';
import { useEditFormTranslations } from '../../context/translations/EditFormTranslationsContext';
import LabeledTimeAndUser from '../../Forms/status/LabeledTimeAndUser';
import { TimestampEvent } from '../../Forms/status/types';
import ExportFormTranslationsButton from '../components/ExportFormTranslationsButton';

interface Props {
  form: Form;
  lastSave: TimestampEvent | undefined;
}

const FormTranslationButtonsColumn = ({ form, lastSave }: Props) => {
  const { logger } = useAppConfig();
  const [isSaving, setIsSaving] = useState(false);
  const { saveChanges } = useEditFormTranslations();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveChanges();
    } catch (error: any) {
      logger?.debug(`Failed to save introPage: ${error.message}`, error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VStack gap="space-4">
      <Button loading={isSaving} onClick={handleSave} type="submit" size="small">
        Lagre
      </Button>
      <ExportFormTranslationsButton form={form} />
      <LabeledTimeAndUser label="Sist lagret:" timestamp={lastSave?.timestamp} userName={lastSave?.userName} />
      <UserFeedback />
    </VStack>
  );
};
export default FormTranslationButtonsColumn;

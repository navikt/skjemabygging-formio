import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import { useFormPersistence } from '../../context/persistence/PersistenceContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import ConfirmationModal from '../fyllut-components/ConfirmationModal';
import { getExitUrl } from '../fyllut-utils/url';

const SaveButton = () => {
  const { translate } = useFyllutLanguage();
  const { submission } = useSubmissionState();
  const { saveDraft } = useFormPersistence();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const deletionDate = submission?.fyllutState?.mellomlagring?.deletionDate ?? '';

  const handleSaveDraft = async () => {
    if (!submission) {
      throw new Error('Kunne ikke lagre. Innsendingen er tom.');
    }

    if (!(await saveDraft())) {
      setSaveError(TEXTS.statiske.mellomlagringError.update.message);
      return false;
    }

    setSaveModalOpen(false);
  };

  return (
    <>
      <Button
        variant="tertiary"
        onClick={() => {
          setSaveError(undefined);
          setSaveModalOpen(true);
        }}
      >
        {translate(TEXTS.grensesnitt.navigation.saveDraft)}
      </Button>
      <ConfirmationModal
        open={saveModalOpen}
        onClose={() => {
          setSaveError(undefined);
          setSaveModalOpen(false);
        }}
        onConfirm={handleSaveDraft}
        confirmType="primary"
        error={saveError}
        texts={{
          ...TEXTS.grensesnitt.confirmSavePrompt,
          body: translate(TEXTS.grensesnitt.confirmSavePrompt.body, { date: deletionDate }),
        }}
        exitUrl={getExitUrl(window.location.href)}
      />
    </>
  );
};

export default SaveButton;

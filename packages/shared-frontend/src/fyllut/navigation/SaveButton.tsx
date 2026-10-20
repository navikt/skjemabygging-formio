import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useFormActions } from '../context/form-actions/FormActionsContext';
import ConfirmationModal from './ConfirmationModal';
import { getExitUrl } from './navUrls';

const SaveButton = ({ showError = true }: { showError?: boolean }) => {
  const { translate } = useLanguage();
  const { submission } = useSubmissionState();
  const { saveDraft, clearError } = useFormActions();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const deletionDate = submission?.fyllutState?.mellomlagring?.deletionDate ?? '';

  const handleSaveDraft = async () => {
    if (!submission) {
      throw new Error('Kunne ikke lagre. Innsendingen er tom.');
    }

    if (!(await saveDraft())) {
      if (showError) {
        // This button surfaces the failure in its own modal, so clear the shared action error to
        // avoid rendering the same message twice (e.g. alongside FormActionError on a form page).
        clearError();
        setSaveError(TEXTS.statiske.mellomlagringError.update.message);
      } else {
        setSaveModalOpen(false);
      }
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

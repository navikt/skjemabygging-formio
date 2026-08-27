import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLocation } from 'react-router';
import { useApplication } from '../../context/application/ApplicationContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import { useAttachmentUpload } from '../attachments/context/AttachmentUploadContext';
import ConfirmationModal from './ConfirmationModal';
import { getExitUrl } from './navUrls';

interface Props {
  exitOnly?: boolean;
}

const CancelAndDeleteButton = ({ exitOnly = false }: Props) => {
  const { applications } = useRuntimeServices();
  const { logger } = useApplication();
  const { submissionMethod } = useSubmissionMethod();
  const { translate } = useLanguage();
  const { search } = useLocation();
  const { setSubmission } = useSubmissionState();
  const { handleDeleteAllFiles } = useAttachmentUpload();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const exitUrl = getExitUrl(window.location.href);
  const innsendingsId = new URLSearchParams(search).get('innsendingsId');

  const handleCancel = async () => {
    if (submissionMethod === 'digital' && innsendingsId) {
      await applications.deleteDraft(innsendingsId);
    } else if (submissionMethod === 'digitalnologin') {
      await handleDeleteAllFiles();
    }

    setSubmission(undefined);
    setCancelModalOpen(false);
  };

  const handleCancelError = (error: unknown) => {
    setDeleteError(TEXTS.statiske.mellomlagringError.delete.message);
    logger?.error?.(`Failed to delete mellomlagring ${innsendingsId}`, error as Error);
  };

  const handleExit = () => {
    setSubmission(undefined);
  };

  return (
    <>
      <Button
        variant="tertiary"
        onClick={() => {
          setDeleteError(undefined);
          setCancelModalOpen(true);
        }}
      >
        {translate(exitOnly ? TEXTS.grensesnitt.navigation.exit : TEXTS.grensesnitt.navigation.cancelAndDelete)}
      </Button>
      <ConfirmationModal
        open={cancelModalOpen}
        onClose={() => {
          setDeleteError(undefined);
          setCancelModalOpen(false);
        }}
        onConfirm={exitOnly ? handleExit : handleCancel}
        onConfirmError={exitOnly ? undefined : handleCancelError}
        confirmType="danger"
        error={deleteError}
        texts={
          exitOnly
            ? TEXTS.grensesnitt.confirmCancelPrompt
            : submissionMethod === 'digital'
              ? TEXTS.grensesnitt.confirmDeletePrompt
              : TEXTS.grensesnitt.confirmDiscardPrompt
        }
        exitUrl={exitUrl}
      />
    </>
  );
};

export default CancelAndDeleteButton;

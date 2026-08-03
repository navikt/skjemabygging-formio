import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLocation } from 'react-router';
import { useFyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { deleteSoknad } from '../api/sendInnSoknad';
import { useAttachmentUpload } from '../attachment-upload/AttachmentUploadContext';
import ConfirmationModal from '../fyllut-components/ConfirmationModal';
import { getExitUrl } from '../fyllut-utils/url';

interface Props {
  exitOnly?: boolean;
}

const CancelAndDeleteButton = ({ exitOnly = false }: Props) => {
  const appConfig = useFyllutAppConfig();
  const { submissionMethod } = appConfig;
  const { translate } = useFyllutLanguage();
  const { search } = useLocation();
  const { setSubmission } = useSubmissionState();
  const { handleDeleteAllFiles } = useAttachmentUpload();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const exitUrl = getExitUrl(window.location.href);
  const innsendingsId = new URLSearchParams(search).get('innsendingsId');

  const handleCancel = async () => {
    if (submissionMethod === 'digital' && innsendingsId) {
      await deleteSoknad(appConfig, innsendingsId);
    } else if (submissionMethod === 'digitalnologin') {
      await handleDeleteAllFiles();
    }

    setSubmission(undefined);
    setCancelModalOpen(false);
  };

  const handleCancelError = (error: unknown) => {
    setDeleteError(TEXTS.statiske.mellomlagringError.delete.message);
    appConfig.logger?.error?.(`Failed to delete mellomlagring ${innsendingsId}`, error as Error);
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

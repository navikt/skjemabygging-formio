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

const DELETED_DRAFT_STORAGE_KEY = 'fyllut:new-render:deleted-draft-id';
const DELETED_DRAFT_QUERY_PARAM = 'deletedDraft';
const DISCARDED_SUBMISSION_STORAGE_KEY = 'fyllut:new-render:discarded-submission';

const CancelAndDeleteButton = ({ exitOnly = false }: Props) => {
  const appConfig = useFyllutAppConfig();
  const { submissionMethod } = appConfig;
  const { translate } = useFyllutLanguage();
  const { search } = useLocation();
  const { setSubmission } = useSubmissionState();
  const { handleDeleteAllFiles } = useAttachmentUpload();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const exitUrl = getExitUrl(window.location.href);
  const innsendingsId = new URLSearchParams(search).get('innsendingsId');

  const handleCancel = async () => {
    if (submissionMethod === 'digital' && innsendingsId) {
      await deleteSoknad(appConfig, innsendingsId);
      sessionStorage.setItem(DELETED_DRAFT_STORAGE_KEY, innsendingsId);
      const deletedDraftUrl = new URL(window.location.href);
      deletedDraftUrl.searchParams.set(DELETED_DRAFT_QUERY_PARAM, '1');
      window.history.replaceState(window.history.state, '', deletedDraftUrl.toString());
    } else if (submissionMethod === 'digitalnologin') {
      await handleDeleteAllFiles();
    }

    setSubmission(undefined);
    setCancelModalOpen(false);
  };

  const handleExit = () => {
    sessionStorage.setItem(DISCARDED_SUBMISSION_STORAGE_KEY, '1');
    setSubmission(undefined);
  };

  return (
    <>
      <Button variant="tertiary" onClick={() => setCancelModalOpen(true)}>
        {translate(exitOnly ? TEXTS.grensesnitt.navigation.exit : TEXTS.grensesnitt.navigation.cancelAndDelete)}
      </Button>
      <ConfirmationModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={exitOnly ? handleExit : handleCancel}
        confirmType="danger"
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

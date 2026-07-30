import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useFyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import { useSubmissionState } from '../framework';
import ConfirmationModal from '../fyllut-components/ConfirmationModal';
import { getExitUrl } from '../fyllut-utils/url';
import { useAttachmentUpload } from './AttachmentUploadContext';

const AttachmentCancelButton = () => {
  const { submissionMethod } = useFyllutAppConfig();
  const { translate } = useFyllutLanguage();
  const { setSubmission } = useSubmissionState();
  const { handleDeleteAllFiles } = useAttachmentUpload();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (submissionMethod !== 'digitalnologin') {
    return null;
  }

  const deleteSubmission = async () => {
    await handleDeleteAllFiles();
    setSubmission(undefined);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <Button variant="tertiary" onClick={() => setIsDeleteModalOpen(true)}>
        {translate(TEXTS.grensesnitt.navigation.cancelAndDelete)}
      </Button>
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteSubmission}
        confirmType="danger"
        texts={TEXTS.grensesnitt.confirmDiscardPrompt}
        exitUrl={getExitUrl(window.location.href)}
      />
    </>
  );
};

export default AttachmentCancelButton;

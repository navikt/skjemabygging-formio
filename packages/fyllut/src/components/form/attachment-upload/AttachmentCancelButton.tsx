import { Button } from '@navikt/ds-react';
import { ConfirmationModal, url, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useSubmissionState } from '@navikt/skjemadigitalisering-shared-frontend';
import { useState } from 'react';
import { useAttachmentUpload } from './AttachmentUploadContext';

const AttachmentCancelButton = () => {
  const { submissionMethod } = useAppConfig();
  const { translate } = useLanguages();
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
        exitUrl={url.getExitUrl(window.location.href)}
      />
    </>
  );
};

export default AttachmentCancelButton;

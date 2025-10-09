import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import urlUtils from '../../util/url/url';
import { useAttachmentUpload } from '../attachment/AttachmentUploadContext';
import ConfirmationModal from '../modal/confirmation/ConfirmationModal';
import { BaseButton } from './BaseButton';

export function CancelButton() {
  const { translate } = useLanguages();
  const { submissionMethod } = useAppConfig();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { deleteMellomlagring } = useSendInn();
  const { handleDeleteAllFiles } = useAttachmentUpload();
  const exitUrl = urlUtils.getExitUrl(window.location.href);

  const deleteSubmission = async () => {
    if (submissionMethod === 'digital') {
      await deleteMellomlagring();
    }

    if (submissionMethod === 'digitalnologin') {
      await handleDeleteAllFiles();
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <BaseButton
        onClick={{
          digital: () => setIsDeleteModalOpen(true),
          paper: () => setIsDeleteModalOpen(true),
          digitalnologin: () => setIsDeleteModalOpen(true),
        }}
        variant="tertiary"
        label={{
          digital: translate(TEXTS.grensesnitt.navigation.cancelAndDelete),
          digitalnologin: translate(TEXTS.grensesnitt.navigation.cancelAndDelete),
          paper: translate(TEXTS.grensesnitt.navigation.cancelAndDelete),
        }}
      />
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteSubmission}
        confirmType={'danger'}
        texts={
          submissionMethod === 'digital'
            ? TEXTS.grensesnitt.confirmDeletePrompt
            : TEXTS.grensesnitt.confirmDiscardPrompt
        }
        exitUrl={exitUrl}
      />
    </>
  );
}

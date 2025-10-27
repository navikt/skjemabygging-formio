import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import urlUtils from '../../util/url/url';
import ConfirmationModal from '../modal/confirmation/ConfirmationModal';
import { BaseButton } from './BaseButton';

export function SaveButton({ submission }: { submission?: Submission }) {
  const { translate } = useLanguages();
  const { submissionMethod } = useAppConfig();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const { updateMellomlagring } = useSendInn();
  const exitUrl = urlUtils.getExitUrl(window.location.href);
  const deletionDate = submission?.fyllutState?.mellomlagring?.deletionDate ?? '';

  const saveSubmission = async () => {
    if (!submission) {
      setIsSaveModalOpen(false);
      throw new Error('Kunne ikke lagre. Innsendingen er tom.');
    }
    await updateMellomlagring(submission);
    setIsSaveModalOpen(false);
  };

  if (submissionMethod !== 'digital') return null;

  return (
    <>
      <BaseButton
        onClick={{
          digital: () => setIsSaveModalOpen(true),
        }}
        variant="tertiary"
        label={{
          digital: translate(TEXTS.grensesnitt.navigation.saveDraft),
        }}
        role="button"
      />
      <ConfirmationModal
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={saveSubmission}
        confirmType={'primary'}
        texts={{
          ...TEXTS.grensesnitt.confirmSavePrompt,
          body: translate(TEXTS.grensesnitt.confirmSavePrompt.body, { date: deletionDate }),
        }}
        exitUrl={exitUrl}
      />
    </>
  );
}

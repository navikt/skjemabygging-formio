import { Button } from '@navikt/ds-react';
import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguages } from '../../../../context/languages';
import { useSendInn } from '../../../../context/sendInn/sendInnContext';
import urlUtils from '../../../../util/url/url';
import ConfirmationModal from '../../../modal/confirmation/ConfirmationModal';

interface Props {
  submission?: Submission;
}

const SaveAndDeleteButtons = ({ submission }: Props) => {
  const { translate } = useLanguages();
  const { updateMellomlagring, deleteMellomlagring } = useSendInn();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const exitUrl = urlUtils.getExitUrl(window.location.href);

  const saveSubmission = async () => {
    if (!submission) {
      setIsSaveModalOpen(false);
      throw new Error('Kunne ikke lagre. Innsendingen er tom.');
    }
    await updateMellomlagring(submission);
    setIsSaveModalOpen(false);
  };

  const deleteSubmission = async () => {
    await deleteMellomlagring();
    setIsDeleteModalOpen(false);
  };

  const deletionDate = submission?.fyllutState?.mellomlagring?.deletionDate ?? '';

  return (
    <>
      <div className="button-row">
        <Button
          className={'navds-button navds-button--tertiary'}
          onClick={() => {
            setIsDeleteModalOpen(true);
          }}
        >
          <span aria-live="polite" className="navds-body-short font-bold">
            {translate(TEXTS.grensesnitt.navigation.cancelAndDelete)}
          </span>
        </Button>
        <Button className={'navds-button navds-button--tertiary'} onClick={() => setIsSaveModalOpen(true)}>
          <span aria-live="polite" className="navds-body-short font-bold">
            {translate(TEXTS.grensesnitt.navigation.saveDraft)}
          </span>
        </Button>
      </div>
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
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteSubmission}
        confirmType={'danger'}
        texts={TEXTS.grensesnitt.confirmDeletePrompt}
        exitUrl={exitUrl}
      />
    </>
  );
};

export default SaveAndDeleteButtons;

/* eslint-disable */
import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import urlUtils from '../../util/url/url';
import { BaseButton } from './BaseButton';

export function CancelButton({ submission }: { submission?: Submission }) {
  const { translate } = useLanguages();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { updateMellomlagring, deleteMellomlagring } = useSendInn();
  const exitUrl = urlUtils.getExitUrl(window.location.href);

  // TODO flytt ut i save knappen
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

  // Digital får opp Ja, avbryt og forkast, Nei, fortsett utfylling og Lagre
  // Papir og digitalnologin får bare opp Ja, avbryt og forkast eller Nei, fortsett utfylling

  return (
    <BaseButton
      onClick={{
        digital: () => setIsDeleteModalOpen(true),
      }}
      variant="tertiary"
      label={{
        digital: translate(TEXTS.grensesnitt.navigation.cancelAndDiscard),
        digitalnologin: translate(TEXTS.grensesnitt.navigation.cancelAndDiscard),
        paper: translate(TEXTS.grensesnitt.navigation.cancelAndDiscard),
      }}
    />
  );
}

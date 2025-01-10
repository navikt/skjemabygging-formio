import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';

type ConfirmDeleteLanguageModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  onConfirm: () => void;
  language: string;
  isGlobal: boolean;
};

const ConfirmDeleteLanguageModal = ({
  isOpen,
  closeModal,
  onConfirm,
  language,
  isGlobal = false,
}: ConfirmDeleteLanguageModalProps) => {
  const modalTextForGlobalTranslations = `Ved å klikke på "slett språk" fjerner du alle globale oversettelser til ${language?.toLowerCase()}, for godt.
        Denne handlingen kan ikke angres.`;
  const modalTextForFormTranslations = `Ved å klikke på "slett språk" fjerner du alle oversettelser til ${language?.toLowerCase()} for dette skjemaet, for godt.
        Denne handlingen kan ikke angres.`;

  return (
    <ConfirmationModal
      open={isOpen}
      onClose={closeModal}
      onConfirm={onConfirm}
      texts={{
        title: 'Bekreft sletting av språk',
        confirm: 'Slett språk',
        cancel: 'Avbryt',
        body: isGlobal ? modalTextForGlobalTranslations : modalTextForFormTranslations,
      }}
    />
  );
};

export default ConfirmDeleteLanguageModal;

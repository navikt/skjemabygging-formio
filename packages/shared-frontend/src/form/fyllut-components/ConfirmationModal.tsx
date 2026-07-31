import { BodyShort, Button, Modal } from '@navikt/ds-react';
import { ReactNode, useState } from 'react';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  width?: 'small' | 'medium';
  exitUrl?: string;
  confirmType?: 'primary' | 'danger';
  texts: {
    title: string;
    body?: string;
    confirm: string;
    cancel?: string;
  };
  children?: ReactNode;
}

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  width = 'medium',
  exitUrl,
  confirmType = 'primary',
  texts,
  children,
}: Props) => {
  const { translate } = useFyllutLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const translateIfAvailable = (text: string) => (text ? translate(text) : text);

  const handleConfirm = async () => {
    if (!onConfirm) {
      onClose();
      if (exitUrl) {
        window.location.assign(exitUrl);
      }
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
      if (exitUrl) {
        window.location.assign(exitUrl);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      aria-label={texts.title}
      onClose={onClose}
      header={{ heading: translateIfAvailable(texts.title) }}
      style={{ maxWidth: width === 'small' ? '30rem' : '50rem' }}
    >
      <Modal.Body>{children ?? (texts.body && <BodyShort>{translateIfAvailable(texts.body)}</BodyShort>)}</Modal.Body>
      <Modal.Footer>
        <Button variant={confirmType} onClick={handleConfirm} loading={isLoading}>
          {translateIfAvailable(texts.confirm)}
        </Button>
        {texts.cancel && (
          <Button variant="tertiary" onClick={onClose} disabled={isLoading}>
            {translateIfAvailable(texts.cancel)}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;

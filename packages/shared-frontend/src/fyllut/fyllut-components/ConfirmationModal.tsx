import { Alert, BodyShort, Button, Modal } from '@navikt/ds-react';
import { ReactNode, useState } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void | boolean> | void | boolean;
  onConfirmError?: (error: unknown) => void;
  width?: 'small' | 'medium';
  exitUrl?: string;
  confirmType?: 'primary' | 'danger';
  error?: string;
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
  onConfirmError,
  width = 'medium',
  exitUrl,
  confirmType = 'primary',
  error,
  texts,
  children,
}: Props) => {
  const { translate } = useLanguage();
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
      const confirmed = await onConfirm();
      if (confirmed === false) {
        return;
      }
      onClose();
      if (exitUrl) {
        window.location.assign(exitUrl);
      }
    } catch (error) {
      if (!onConfirmError) {
        throw error;
      }
      onConfirmError(error);
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
      <Modal.Body>
        {children ?? (texts.body && <BodyShort>{translateIfAvailable(texts.body)}</BodyShort>)}
        {error && <Alert variant="error">{translateIfAvailable(error)}</Alert>}
      </Modal.Body>
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

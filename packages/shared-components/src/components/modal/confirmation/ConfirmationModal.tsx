import { BodyShort, Button } from '@navikt/ds-react';
import React, { useState } from 'react';
import { Modal, useLanguages } from '../../../index';
import makeStyles from '../../../util/styles/jss/jss';

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
  children?: React.ReactNode;
}

const useStyles = makeStyles({
  modal: {
    textAlign: 'left',
  },
});

const ConfirmationModal = (props: Props) => {
  const { translate } = useLanguages();
  const [isLoading, setIsLoading] = useState(false);
  const styles = useStyles();

  const { onConfirm, exitUrl, confirmType, texts, children, ...modalProps } = props;

  const translateIfAvailable = (text: string) => {
    if (translate && text) {
      return translate(text);
    }

    return text;
  };

  const onClickConfirm = async () => {
    try {
      if (onConfirm) {
        setIsLoading(true);
        await onConfirm();
        setIsLoading(false);
      }
      modalProps.onClose();
      if (exitUrl) {
        window.location.assign(exitUrl);
      }
    } catch (_error) {
      setIsLoading(false);
      modalProps.onClose();
    }
  };

  return (
    <Modal {...modalProps} title={translateIfAvailable(texts.title)} className={styles.modal}>
      <Modal.Body>
        {children ? children : texts.body && <BodyShort>{translateIfAvailable(texts.body)}</BodyShort>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant={confirmType ?? 'primary'} onClick={onClickConfirm} loading={isLoading}>
          {translateIfAvailable(texts.confirm)}
        </Button>
        {texts.cancel && (
          <Button variant="tertiary" onClick={props.onClose} disabled={isLoading}>
            {translateIfAvailable(texts.cancel)}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;

import { BodyShort, Button } from '@navikt/ds-react';
import { useState } from 'react';
import { Modal, useLanguages } from '../../../index';

import makeStyles from '../../../util/jss';

const useStyles = makeStyles({
  modalBody: {
    paddingTop: '1.1rem',
    paddingBottom: '4rem',
    fontSize: '1.25rem',
  },
  modal: {
    maxWidth: '40rem',
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<any | Error> | void;
  exitUrl?: string;
  confirmType: 'primary' | 'danger';
  texts: {
    title: string;
    body: string;
    confirm: string;
    cancel: string;
  };
}

const ConfirmationModal = (props: Props) => {
  const { translate } = useLanguages();
  const [isLoading, setIsLoading] = useState(false);
  const styles = useStyles();

  const { onConfirm, exitUrl, confirmType, texts, ...modalProps } = props;

  const onClickConfirm = async () => {
    setIsLoading(true);
    const result: any | Error = await onConfirm(); // TODO
    setIsLoading(false);
    if (result instanceof Error) {
      modalProps.onClose();
      return;
    }
    if (exitUrl) {
      window.location.assign(exitUrl);
    }
  };

  return (
    <Modal className={styles.modal} {...modalProps} title={translate(texts.title)}>
      <BodyShort className={styles.modalBody}>{translate(texts.body)}</BodyShort>
      <div className="button-row">
        <Button variant={confirmType} onClick={onClickConfirm} loading={isLoading}>
          {translate(texts.confirm)}
        </Button>
        <Button variant="tertiary" onClick={props.onClose}>
          {translate(texts.cancel)}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

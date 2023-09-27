import { BodyShort, Button } from "@navikt/ds-react";
import { Modal, useLanguages } from "../../../index";
import { useState } from "react";

import makeStyles from "../../../util/jss";

const useStyles = makeStyles({
  modalBody: {
    paddingTop: "1.1rem",
    paddingBottom: "4rem",
    fontSize: "1.25rem",
  },
  modal: {
    maxWidth: "40rem",
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<any> | void;
  onError?: Function;
  exitUrl?: string;
  confirmType: "primary" | "danger";
  texts: {
    title: string;
    body: string;
    confirm: string;
    cancel: string;
  };
}

const noop = () => {};

const ConfirmationModal = (props: Props) => {
  const { translate } = useLanguages();
  const [isLoading, setIsLoading] = useState(false);
  const styles = useStyles();

  const { onConfirm, onError = noop, exitUrl, confirmType, texts, ...modalProps } = props;

  const onClickConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setIsLoading(false);
      if (exitUrl) {
        window.location.assign(exitUrl);
      }
    } catch (error: any) {
      onError(error);
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
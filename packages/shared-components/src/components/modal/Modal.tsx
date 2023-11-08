import { Modal as NavModal } from '@navikt/ds-react';
import React from 'react';
import makeStyles from '../../util/styles/jss/jss';

const useModalStyles = makeStyles({
  modal: {
    maxWidth: '50rem',
  },
});

interface Props {
  onClose: () => void;
  title: string;
  open?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Modal = ({ onClose, open = false, title, className, children }: Props) => {
  const styles = useModalStyles();

  return (
    <NavModal
      open={open}
      aria-label={title}
      onClose={onClose}
      className={className ?? styles.modal}
      header={{ heading: title }}
    >
      {children}
    </NavModal>
  );
};

Modal.Body = NavModal.Body;
Modal.Footer = NavModal.Footer;

export default Modal;

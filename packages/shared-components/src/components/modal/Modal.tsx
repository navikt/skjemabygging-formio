import { Modal as NavModal } from '@navikt/ds-react';
import React from 'react';
import makeStyles from '../../util/styles/jss/jss';

interface Props {
  onClose: () => void;
  title: string;
  width?: 'small' | 'medium';
  open?: boolean;
  className?: string;
  children: React.ReactNode;
}

const useModalStyles = makeStyles<string, Partial<Props>>({
  modal: {
    maxWidth: (props) => (props.width === 'small' ? '30rem' : '50rem'),
  },
});

const Modal = ({ onClose, open = false, title, className, width = 'medium', children }: Props) => {
  const styles = useModalStyles({ width });

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

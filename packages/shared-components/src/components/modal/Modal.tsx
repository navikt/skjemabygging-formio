import { Heading, Modal as NavModal } from '@navikt/ds-react';
import React from 'react';
import makeStyles from '../../util/styles/jss/jss';

const useModalStyles = makeStyles({
  modal: {
    width: '50rem',
    maxWidth: '90%',
    padding: '1rem',
  },
});

interface Props {
  onClose: () => void;
  appElement?: string | HTMLElement;
  title?: string;
  open?: boolean;
  shouldCloseOnOverlayClick?: boolean;
  ariaLabel?: string;
  className?: string;
  children: React.ReactNode;
}

const Modal = ({
  onClose,
  open = false,
  shouldCloseOnOverlayClick = true,
  title,
  ariaLabel,
  className,
  children,
}: Props) => {
  const styles = useModalStyles();

  return (
    <NavModal
      open={open}
      aria-label={ariaLabel ?? title}
      onClose={onClose}
      className={className ?? styles.modal}
      closeButton={true}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    >
      <NavModal.Content>
        {title && (
          <Heading spacing level="1" size="small">
            {title}
          </Heading>
        )}
        {children}
      </NavModal.Content>
    </NavModal>
  );
};

Modal.setAppElement = (appElement?: string | HTMLElement) => {
  NavModal.setAppElement?.(appElement);
};

export default Modal;

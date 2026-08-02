import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './FormButtonRow.module.css';

interface FormButtonRowProps {
  nextButton?: ReactNode;
  previousButton?: ReactNode;
  saveButton?: ReactNode;
  cancelButton?: ReactNode;
}

const FormButtonRow = ({ nextButton, previousButton, saveButton, cancelButton }: FormButtonRowProps) => {
  const twoElementsFirstRow = !!nextButton && !!previousButton;
  const twoElementsSecondRow = !!cancelButton && !!saveButton;

  return (
    <nav>
      <div className={styles.row}>
        {nextButton}
        {previousButton}
      </div>
      <div className={`${styles.row} ${twoElementsFirstRow && !twoElementsSecondRow ? styles.center : ''}`}>
        {cancelButton}
        {saveButton}
      </div>
    </nav>
  );
};

interface NextButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  role?: 'link' | 'button';
}

const FormNextButton = ({ label, onClick, disabled, loading, role = 'link' }: NextButtonProps) => (
  <Button
    role={role}
    onClick={onClick}
    icon={<ArrowRightIcon aria-hidden />}
    iconPosition="right"
    disabled={disabled}
    loading={loading}
  >
    {label}
  </Button>
);

interface PrevButtonProps {
  label: string;
  onClick: () => void;
  role?: 'link' | 'button';
}

const FormPrevButton = ({ label, onClick, role = 'link' }: PrevButtonProps) => (
  <Button variant="secondary" role={role} onClick={onClick} icon={<ArrowLeftIcon aria-hidden />} iconPosition="left">
    {label}
  </Button>
);

export { FormButtonRow, FormNextButton, FormPrevButton };

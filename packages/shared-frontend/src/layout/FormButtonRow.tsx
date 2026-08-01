import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Box, Button } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './FormButtonRow.module.css';

interface FormButtonRowProps {
  previousButton?: ReactNode;
  nextButton?: ReactNode;
}

/**
 * Navigation button row: row-reverse layout so Next appears on the left (primary action) and
 * Previous on the right.
 */
const FormButtonRow = ({ previousButton, nextButton }: FormButtonRowProps) => (
  <nav>
    <Box marginBlock="space-40 space-20" className={styles.row}>
      {nextButton}
      {previousButton}
    </Box>
  </nav>
);

interface NextButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  role?: 'link' | 'button';
}

const FormNextButton = ({ label, onClick, disabled, loading, role = 'link' }: NextButtonProps) => (
  <Button
    as="a"
    href="#"
    role={role}
    onClick={(event) => {
      event.preventDefault();
      if (disabled) {
        return;
      }
      onClick();
    }}
    icon={<ArrowRightIcon aria-hidden />}
    iconPosition="right"
    disabled={disabled}
    loading={loading}
    className={styles.button}
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
  <Button
    as="a"
    href="#"
    variant="secondary"
    role={role}
    onClick={(event) => {
      event.preventDefault();
      onClick();
    }}
    icon={<ArrowLeftIcon aria-hidden />}
    iconPosition="left"
    className={styles.button}
  >
    {label}
  </Button>
);

export { FormButtonRow, FormNextButton, FormPrevButton };

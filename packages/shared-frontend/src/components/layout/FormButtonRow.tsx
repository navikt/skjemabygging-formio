import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Box, Button } from '@navikt/ds-react';
import { ReactNode } from 'react';
import styles from './FormButtonRow.module.css';

interface FormButtonRowProps {
  previousButton?: ReactNode;
  nextButton?: ReactNode;
}

/**
 * Navigation button row matching the old shared-components ButtonRow design:
 * row-reverse layout so Next appears on the left (primary action), Previous on the right,
 * with equal min-width and responsive stacking on small screens.
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
  loading?: boolean;
}

const FormNextButton = ({ label, onClick, loading }: NextButtonProps) => (
  <Button
    type="button"
    onClick={onClick}
    icon={<ArrowRightIcon aria-hidden />}
    iconPosition="right"
    loading={loading}
    className={styles.button}
  >
    {label}
  </Button>
);

interface PrevButtonProps {
  label: string;
  onClick: () => void;
}

const FormPrevButton = ({ label, onClick }: PrevButtonProps) => (
  <Button
    type="button"
    variant="secondary"
    onClick={onClick}
    icon={<ArrowLeftIcon aria-hidden />}
    iconPosition="left"
    className={styles.button}
  >
    {label}
  </Button>
);

export { FormButtonRow, FormNextButton, FormPrevButton };

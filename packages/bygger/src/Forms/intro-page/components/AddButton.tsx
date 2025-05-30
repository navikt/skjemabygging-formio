import { PlusIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

type AddButtonProps = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'xsmall' | undefined;
};

const useStyles = makeStyles({
  addButton: {
    borderRadius: 'var(--a-border-radius-large)',
    margin: 'var(--a-space-12) var(--a-space-16) var(--a-space-12) 0',
  },
});

export function AddButton({ label, onClick, variant = 'secondary', size = 'small' }: AddButtonProps) {
  const styles = useStyles();

  return (
    <Button
      icon={<PlusIcon />}
      variant={variant || 'primary'}
      size={size}
      className={styles.addButton}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

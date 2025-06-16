import { PlusIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { addButtonStyles } from './styles';

type AddButtonProps = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'xsmall' | undefined;
};

export function AddButton({ label, onClick, variant = 'secondary', size = 'small' }: AddButtonProps) {
  const styles = addButtonStyles();

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

import { ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';

interface Props {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

const FormNextButton = ({ label, onClick, disabled, loading, variant = 'primary' }: Props) => (
  <Button
    type="button"
    variant={variant}
    onClick={onClick}
    icon={<ArrowRightIcon aria-hidden />}
    iconPosition="right"
    disabled={disabled}
    loading={loading}
  >
    {label}
  </Button>
);

export { FormNextButton };

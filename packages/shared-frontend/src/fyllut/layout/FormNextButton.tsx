import { ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';

interface Props {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const FormNextButton = ({ label, onClick, disabled, loading }: Props) => (
  <Button
    type="button"
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

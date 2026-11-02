import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';

interface Props {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const FormPrevButton = ({ label, onClick, variant = 'secondary' }: Props) => (
  <Button type="button" variant={variant} onClick={onClick} icon={<ArrowLeftIcon aria-hidden />} iconPosition="left">
    {label}
  </Button>
);

export { FormPrevButton };

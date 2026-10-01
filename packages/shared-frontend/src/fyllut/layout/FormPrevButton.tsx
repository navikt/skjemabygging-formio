import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';

interface Props {
  label: string;
  onClick: () => void;
}

const FormPrevButton = ({ label, onClick }: Props) => (
  <Button type="button" variant="secondary" onClick={onClick} icon={<ArrowLeftIcon aria-hidden />} iconPosition="left">
    {label}
  </Button>
);

export { FormPrevButton };

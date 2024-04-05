import { Button } from '@navikt/ds-react';
import React, { useState } from 'react';

interface Props {
  children: React.ReactNode;
  onClick: Function;
  variant?:
    | 'primary'
    | 'primary-neutral'
    | 'secondary'
    | 'secondary-neutral'
    | 'tertiary'
    | 'tertiary-neutral'
    | 'danger';
}

const ButtonWithSpinner = ({ children, onClick, variant = 'primary' }: Props) => {
  const [isSaving, setIsSaving] = useState(false);
  async function onClickWithSpinner() {
    setIsSaving(true);
    try {
      await onClick();
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <Button variant={variant} onClick={onClickWithSpinner} loading={isSaving}>
      {children}
    </Button>
  );
};

export default ButtonWithSpinner;

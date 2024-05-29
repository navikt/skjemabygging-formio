import { Button } from '@navikt/ds-react';
import React, { useState } from 'react';

interface Props {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick: Function;
  variant?:
    | 'primary'
    | 'primary-neutral'
    | 'secondary'
    | 'secondary-neutral'
    | 'tertiary'
    | 'tertiary-neutral'
    | 'danger';
  size?: 'medium' | 'small' | 'xsmall';
}

const ButtonWithSpinner = ({ children, className, onClick, variant = 'primary', size = 'medium', icon }: Props) => {
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
    <Button
      className={className}
      variant={variant}
      onClick={onClickWithSpinner}
      loading={isSaving}
      size={size}
      icon={icon}
    >
      {children}
    </Button>
  );
};

export default ButtonWithSpinner;

import { Button } from '@navikt/ds-react';
import React, { useState } from 'react';

interface Props {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  variant?:
    | 'primary'
    | 'primary-neutral'
    | 'secondary'
    | 'secondary-neutral'
    | 'tertiary'
    | 'tertiary-neutral'
    | 'danger';
  size?: 'medium' | 'small' | 'xsmall';
  download?: boolean;
}

const ButtonWithSpinner = ({
  children,
  className,
  onClick,
  variant = 'primary',
  size = 'medium',
  icon,
  download,
}: Props) => {
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
      download={download}
      as={'a'}
    >
      {children}
    </Button>
  );
};

export default ButtonWithSpinner;

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
}

const ButtonWithSpinner = ({ children, className, onClick, variant = 'primary', size = 'medium', icon }: Props) => {
  const [processing, setProcessing] = useState(false);
  async function onClickWithSpinner() {
    if (!processing) {
      setProcessing(true);
      try {
        await onClick();
      } finally {
        setProcessing(false);
      }
    }
  }
  return (
    <Button
      className={className}
      variant={variant}
      onClick={onClickWithSpinner}
      loading={processing}
      size={size}
      icon={icon}
    >
      {children}
    </Button>
  );
};

export default ButtonWithSpinner;

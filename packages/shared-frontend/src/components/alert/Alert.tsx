import { Alert as AkselAlert } from '@navikt/ds-react';
import { ReactNode } from 'react';
import InputBox, { Spacing } from '../input/InputBox';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant: AlertVariant;
  inline?: boolean;
  size?: 'medium' | 'small';
  marginBottom?: Spacing;
  children: ReactNode;
}

const Alert = ({ variant, inline, size = 'medium', marginBottom, children }: AlertProps) => (
  <InputBox marginBottom={marginBottom}>
    <AkselAlert variant={variant} inline={inline} fullWidth={false} size={size}>
      {children}
    </AkselAlert>
  </InputBox>
);

export default Alert;
export type { AlertProps, AlertVariant };

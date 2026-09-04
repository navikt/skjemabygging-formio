import { Alert as AkselAlert } from '@navikt/ds-react';
import { ReactNode } from 'react';
import FormElementBox, { Spacing } from '../shared/FormElementBox';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant: AlertVariant;
  inline?: boolean;
  size?: 'medium' | 'small';
  marginBottom?: Spacing;
  children: ReactNode;
}

const Alert = ({ variant, inline, size = 'medium', marginBottom, children }: AlertProps) => (
  <FormElementBox marginBottom={marginBottom}>
    <AkselAlert variant={variant} inline={inline} fullWidth={false} size={size}>
      {children}
    </AkselAlert>
  </FormElementBox>
);

export default Alert;
export type { AlertProps, AlertVariant };

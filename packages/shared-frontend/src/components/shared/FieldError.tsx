import { ErrorMessage } from '@navikt/ds-react';
import { ReactNode } from 'react';

interface FieldErrorProps {
  id: string;
  error?: ReactNode;
  className?: string;
}

const FieldError = ({ id, error, className }: FieldErrorProps) => (
  <div id={id} aria-live="polite" aria-relevant="additions removals">
    {error && (
      <ErrorMessage className={className} showIcon>
        {error}
      </ErrorMessage>
    )}
  </div>
);

export default FieldError;

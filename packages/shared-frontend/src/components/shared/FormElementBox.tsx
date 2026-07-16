import { Box } from '@navikt/ds-react';
import { ReactNode } from 'react';

type Spacing = 'space-16' | 'space-32' | 'space-40' | 'space-56';

interface FormElementBoxProps {
  marginBottom?: Spacing;
  children?: ReactNode;
}

const FormElementBox = ({ marginBottom = 'space-32', children }: FormElementBoxProps) => (
  <Box
    marginBlock={`space-0 ${marginBottom}`}
    // Temporary Cypress/legacy compatibility. Remove when shared-frontend no longer needs `.form-group`.
    className="form-group"
  >
    {children}
  </Box>
);

export default FormElementBox;
export type { FormElementBoxProps, Spacing };

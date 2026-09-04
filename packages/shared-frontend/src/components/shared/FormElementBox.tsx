import { Box } from '@navikt/ds-react';
import { FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import styles from './FormElementBox.module.css';

type Spacing = 'space-0' | 'space-16' | 'space-32' | 'space-40' | 'space-56';

interface FormElementBoxProps {
  marginBottom?: Spacing;
  fieldSize?: FieldSize;
  children?: ReactNode;
}

const FormElementBox = ({ marginBottom = 'space-32', fieldSize, children }: FormElementBoxProps) => {
  const className = [styles.field, fieldSize ? styles.sized : undefined, fieldSize ? styles[fieldSize] : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <Box className={className} marginBlock={`space-0 ${marginBottom}`}>
      {children}
    </Box>
  );
};

export default FormElementBox;
export type { FormElementBoxProps, Spacing };

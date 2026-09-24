import { Box } from '@navikt/ds-react';
import { FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import styles from './FormElementBox.module.css';

type Spacing = 'space-0' | 'space-16' | 'space-32' | 'space-40' | 'space-56';

interface FormElementBoxProps {
  marginBottom?: Spacing;
  fieldSize?: FieldSize;
  className?: string;
  children?: ReactNode;
}

const FormElementBox = ({ marginBottom = 'space-32', fieldSize, className, children }: FormElementBoxProps) => {
  const boxClassName = [
    styles.field,
    fieldSize ? styles.sized : undefined,
    fieldSize ? styles[fieldSize] : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Box className={boxClassName} marginBlock={`space-0 ${marginBottom}`}>
      {children}
    </Box>
  );
};

export default FormElementBox;
export type { FormElementBoxProps, Spacing };

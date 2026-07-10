import { Box } from '@navikt/ds-react';
import { ReactNode } from 'react';

type Spacing = 'space-16' | 'space-32' | 'space-40' | 'space-56';

interface InputBoxProps {
  marginBottom?: Spacing;
  children?: ReactNode;
}

const InputBox = ({ marginBottom = 'space-32', children }: InputBoxProps) => (
  <Box marginBlock={`space-0 ${marginBottom}`}>{children}</Box>
);

export default InputBox;
export type { InputBoxProps, Spacing };

import { Box } from '@navikt/ds-react';
import { ReactNode } from 'react';

type Spacing = 'space-16' | 'space-32' | 'space-40' | 'space-56';

interface InputBoxProps {
  bottom?: Spacing;
  children?: ReactNode;
}

const InputBox = ({ bottom = 'space-32', children }: InputBoxProps) => (
  <Box marginBlock={`space-0 ${bottom}`}>{children}</Box>
);

export default InputBox;
export type { InputBoxProps, Spacing };

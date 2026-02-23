import { Box } from '@navikt/ds-react';

interface FormBoxProps {
  bottom?: 'space-16' | 'space-32' | 'space-40' | 'space-56';
  children?: React.ReactNode;
}

const FormBox = (props: FormBoxProps) => {
  const { bottom, children } = props;
  const marginBlock = bottom ? (`space-0 ${bottom}` as const) : 'space-0';

  return <Box marginBlock={marginBlock}>{children}</Box>;
};

export default FormBox;
export type { FormBoxProps };

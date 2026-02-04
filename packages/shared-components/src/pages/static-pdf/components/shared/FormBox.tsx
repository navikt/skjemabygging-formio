import { Box } from '@navikt/ds-react';

interface FormBoxProps {
  inputWidth?: 'input--xxs' | 'input--xs' | 'input--s' | 'input--m' | 'input--l' | 'input--xl' | 'input--xxl';
  bottom?: 'space-16' | 'space-32' | 'space-40' | 'space-56';
  children?: React.ReactNode;
}

const FormBox = (props: FormBoxProps) => {
  const { inputWidth, bottom, children } = props;

  const getWidth = () => {
    switch (inputWidth) {
      case 'input--xxs':
        return {
          width: '35px',
        };
      case 'input--xs':
        return {
          width: '70px',
        };
      case 'input--s':
        return {
          width: '140px',
        };
      case 'input--m':
        return {
          width: '210px',
        };
      case 'input--l':
        return {
          width: '280px',
        };
      case 'input--xl':
        return {
          width: '100%',
          maxWidth: '350px',
        };
      case 'input--xxl':
        return {
          width: '100%',
          maxWidth: '420px',
        };
      default:
        return {};
    }
  };

  const marginBlock = bottom ? (`space-0 ${bottom}` as const) : 'space-0';

  return (
    <Box marginBlock={marginBlock} {...getWidth()}>
      {children}
    </Box>
  );
};

export default FormBox;
export type { FormBoxProps };

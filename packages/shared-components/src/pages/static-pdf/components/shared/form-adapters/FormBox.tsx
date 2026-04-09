import { FormBox as SharedFrontendFormBox } from '@navikt/skjemadigitalisering-shared-frontend';

interface FormBoxProps {
  bottom?: 'space-16' | 'space-32' | 'space-40' | 'space-56';
  children?: React.ReactNode;
}

const FormBox = (props: FormBoxProps) => {
  return <SharedFrontendFormBox {...props} />;
};

export default FormBox;
export type { FormBoxProps };

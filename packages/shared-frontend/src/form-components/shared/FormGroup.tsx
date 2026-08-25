import { ReactNode } from 'react';

interface FormGroupProps {
  children?: ReactNode;
}

const FormGroup = ({ children }: FormGroupProps) => <div className="form-group">{children}</div>;

export default FormGroup;
export type { FormGroupProps };

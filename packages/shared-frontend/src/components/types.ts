import { Spacing } from './input/InputBox';

interface BaseFieldProps {
  statePath: string;
  label?: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  marginBottom?: Spacing;
}

export type { BaseFieldProps };

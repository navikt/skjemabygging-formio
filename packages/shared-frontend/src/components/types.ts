import { Spacing } from './shared/FormElementBox';

interface BaseFieldProps {
  statePath: string;
  label?: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  marginBottom?: Spacing;
}

export type { BaseFieldProps };

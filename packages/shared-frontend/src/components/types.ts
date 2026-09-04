import type { FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import type { ReadMoreProps } from './read-more/ReadMore';
import { Spacing } from './shared/FormElementBox';

interface BaseFieldProps {
  statePath: string;
  label?: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  fieldSize?: FieldSize;
  marginBottom?: Spacing;
  readMore?: ReadMoreProps;
}

export type { BaseFieldProps };

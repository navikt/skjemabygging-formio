import { TextFieldModel } from '@navikt/skjemadigitalisering-shared-domain';

type ResolvedTextFieldValue = string | number | boolean;

interface ResolvedTextFieldModel extends TextFieldModel {
  submissionPath: string;
  translatedLabel?: string;
  value: ResolvedTextFieldValue;
}

type ResolvedComponentModel = ResolvedTextFieldModel;

export type { ResolvedComponentModel, ResolvedTextFieldModel, ResolvedTextFieldValue };

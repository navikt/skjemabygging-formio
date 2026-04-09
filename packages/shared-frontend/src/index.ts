import SharedFrontendBoundary from './SharedFrontendBoundary';
import {
  FormBox,
  FormCheckboxes,
  FormErrorSummary,
  FormRadio,
  FormSelect,
  FormTextField,
  TranslatedDescription,
  TranslatedLabel,
} from './shared-form/input';
import RenderSummaryForm from './shared-form/summary/RenderSummaryForm';

const sharedFrontendPackageName = '@navikt/skjemadigitalisering-shared-frontend';

export type { SharedFrontendBoundaryProps } from './SharedFrontendBoundary';
export type {
  FormBoxProps,
  FormCheckboxGroupProps,
  FormErrorSummaryProps,
  FormRadioProps,
  FormSelectProps,
  FormTextFieldProps,
  SharedFormInputError,
  SharedFormInputRef,
  SharedFormInputRuntime,
  SharedFormInputValidationRuntime,
  SharedFormInputValidators,
  SharedFormTranslate,
  TranslatedDescriptionProps,
  TranslatedLabelProps,
} from './shared-form/input';
export type { FormComponentProps, FormComponentRegistry, SummaryRuntimeConfig } from './shared-form/summary/types';
export {
  FormBox,
  FormCheckboxes,
  FormErrorSummary,
  FormRadio,
  FormSelect,
  FormTextField,
  RenderSummaryForm,
  SharedFrontendBoundary,
  sharedFrontendPackageName,
  TranslatedDescription,
  TranslatedLabel,
};

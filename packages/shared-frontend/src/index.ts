import FormErrorSummary from './components/error-summary/FormErrorSummary';
import ValidationExclamationIcon from './components/icons/ValidationExclamationIcon';
import NavUnitSelect from './components/nav-unit-select/NavUnitSelect';
import { ApplicationProvider, useApplication } from './context/application/ApplicationContext';
import { FormActionsProvider, useFormActions } from './context/form-actions/FormActionsContext';
import { FormDefinitionProvider, useFormDefinition } from './context/form-definition/FormDefinitionContext';
import { applyPrefilledValuesToSubmission } from './context/form-definition/prefillSubmission';
import { LanguageProvider, useLanguage } from './context/language/LanguageContext';
import { initializeSubmission } from './context/state/initializeSubmission';
import { SubmissionStateProvider, useSubmissionState } from './context/state/SubmissionStateContext';
import { SubmissionMethodProvider, useSubmissionMethod } from './context/submission-method/SubmissionMethodContext';
import { useValidation, ValidationProvider } from './context/validation/ValidationContext';
import RenderSummaryForm from './form-summary/RenderSummaryForm';
import {
  buildDigitalFormSearch,
  isSoknadAlreadyExistsResponse,
  shouldUseLegacyPageForNewRenderer,
} from './fyllut/digitalDraftUtils';
import { inputComponentRegistry } from './fyllut/form-components/inputComponentRegistry';
import RenderInputForm from './fyllut/form-components/RenderInputForm';
import { FyllutProvider, useFyllut } from './fyllut/FyllutContext';
import RenderForm from './fyllut/RenderForm';
import { resolveDefaultSubmissionMethod } from './fyllut/submissionMethodResolution';
import { FormButtonRow, FormNextButton, FormPrevButton } from './layout/FormButtonRow';
import FormHeader from './layout/FormHeader';
import FormIcon from './layout/FormIcon';
import FormLayout from './layout/FormLayout';
import FormStepper from './layout/FormStepper';
import { StepperProvider } from './layout/StepperContext';
import SharedFrontendBoundary from './SharedFrontendBoundary';
import './styles/tokens.css';
import { useWizardController } from './wizard/useWizardController';

const sharedFrontendPackageName = '@navikt/skjemadigitalisering-shared-frontend';

export type { NavUnitSelectProps } from './components/nav-unit-select/NavUnitSelect';
export type {
  ApplicationContextValue,
  ApplicationEnvironment,
  ApplicationLogger,
} from './context/application/ApplicationContext';
export type {
  FormActionHandlers,
  FormActionsContextValue,
  FormActionStatus,
} from './context/form-actions/FormActionsContext';
export type { LanguageContextValue } from './context/language/LanguageContext';
export type { FieldError, ValidationContextType } from './context/validation/ValidationContext';
export type { RenderSummaryFormProps } from './form-summary/RenderSummaryForm';
export type {
  FormComponentProps,
  FormComponentRegistry,
  HandleAttachmentDownloadFile,
  SummaryRendererAppConfig,
  SummaryRendererConfig,
} from './form-summary/types';
export type { InputComponentProps, InputComponentRegistry } from './fyllut/form-components/inputComponentRegistryUtils';
export type { FyllutContextValue, FyllutEvent, FyllutHttp, FyllutHttpHeaders } from './fyllut/FyllutContext';
export type { RenderFormProps } from './fyllut/RenderForm';
export type { SharedFrontendBoundaryProps } from './SharedFrontendBoundary';
export type { WizardController } from './wizard/useWizardController';
export {
  ApplicationProvider,
  applyPrefilledValuesToSubmission,
  buildDigitalFormSearch,
  FormActionsProvider,
  FormButtonRow,
  FormDefinitionProvider,
  FormErrorSummary,
  FormHeader,
  FormIcon,
  FormLayout,
  FormNextButton,
  FormPrevButton,
  FormStepper,
  FyllutProvider,
  initializeSubmission,
  inputComponentRegistry,
  isSoknadAlreadyExistsResponse,
  LanguageProvider,
  NavUnitSelect,
  RenderForm,
  RenderInputForm,
  RenderSummaryForm,
  resolveDefaultSubmissionMethod,
  SharedFrontendBoundary,
  sharedFrontendPackageName,
  shouldUseLegacyPageForNewRenderer,
  StepperProvider,
  SubmissionMethodProvider,
  SubmissionStateProvider,
  useApplication,
  useFormActions,
  useFormDefinition,
  useFyllut,
  useLanguage,
  useSubmissionMethod,
  useSubmissionState,
  useValidation,
  useWizardController,
  ValidationExclamationIcon,
  ValidationProvider,
};

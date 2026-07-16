import FormErrorSummary from './components/error-summary/FormErrorSummary';
import ValidationExclamationIcon from './components/icons/ValidationExclamationIcon';
import { AppConfigProvider, useAppConfig } from './context/app-config/AppConfigContext';
import { FormDefinitionProvider, useFormDefinition } from './context/form-definition/FormDefinitionContext';
import { applyPrefilledValuesToSubmission } from './context/form-definition/prefillSubmission';
import { LanguageProvider, useLanguage } from './context/language/LanguageContext';
import { FormPersistenceProvider, useFormPersistence } from './context/persistence/PersistenceContext';
import { initializeSubmission } from './context/state/initializeSubmission';
import { SubmissionStateProvider, useSubmissionState } from './context/state/SubmissionStateContext';
import { useValidation, ValidationProvider } from './context/validation/ValidationContext';
import { inputComponentRegistry } from './form-components/inputComponentRegistry';
import RenderInputForm from './form-components/RenderInputForm';
import RenderSummaryForm from './form-components/RenderSummaryForm';
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

export type {
  FormPersistenceContextType,
  FormPersistenceHandlers,
  PersistenceStatus,
} from './context/persistence/PersistenceContext';
export type { FieldError, ValidationContextType } from './context/validation/ValidationContext';
export type { InputComponentProps, InputComponentRegistry } from './form-components/inputComponentRegistry';
export type { RenderSummaryFormProps } from './form-components/RenderSummaryForm';
export type {
  FormComponentProps,
  FormComponentRegistry,
  HandleAttachmentDownloadFile,
  SummaryRendererAppConfig,
} from './form-components/types';
export type { SharedFrontendBoundaryProps } from './SharedFrontendBoundary';
export type { WizardController } from './wizard/useWizardController';
export {
  AppConfigProvider,
  applyPrefilledValuesToSubmission,
  FormButtonRow,
  FormDefinitionProvider,
  FormErrorSummary,
  FormHeader,
  FormIcon,
  FormLayout,
  FormNextButton,
  FormPersistenceProvider,
  FormPrevButton,
  FormStepper,
  initializeSubmission,
  inputComponentRegistry,
  LanguageProvider,
  RenderInputForm,
  RenderSummaryForm,
  SharedFrontendBoundary,
  sharedFrontendPackageName,
  StepperProvider,
  SubmissionStateProvider,
  useAppConfig,
  useFormDefinition,
  useFormPersistence,
  useLanguage,
  useSubmissionState,
  useValidation,
  useWizardController,
  ValidationExclamationIcon,
  ValidationProvider,
};

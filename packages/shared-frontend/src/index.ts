import FormErrorSummary from './components/error-summary/FormErrorSummary';
import ValidationExclamationIcon from './components/icons/ValidationExclamationIcon';
import { AppConfigProvider, useAppConfig } from './context/app-config/AppConfigContext';
import { FormDefinitionProvider, useFormDefinition } from './context/form-definition/FormDefinitionContext';
import { applyPrefilledValuesToSubmission } from './context/form-definition/prefillSubmission';
import { FyllutAppConfigProvider, useFyllutAppConfig } from './context/fyllut/FyllutAppConfigContext';
import { FyllutLanguageProvider, useFyllutLanguage } from './context/fyllut/FyllutLanguageContext';
import { LanguageProvider, useLanguage } from './context/language/LanguageContext';
import { FormPersistenceProvider, useFormPersistence } from './context/persistence/PersistenceContext';
import { initializeSubmission } from './context/state/initializeSubmission';
import { SubmissionStateProvider, useSubmissionState } from './context/state/SubmissionStateContext';
import { useValidation, ValidationProvider } from './context/validation/ValidationContext';
import { inputComponentRegistry } from './form-components/inputComponentRegistry';
import RenderInputForm from './form-components/RenderInputForm';
import RenderSummaryForm from './form-components/RenderSummaryForm';
import {
  buildDigitalFormSearch,
  isSoknadAlreadyExistsResponse,
  shouldUseLegacyPageForNewRenderer,
} from './form/digitalDraftUtils';
import RenderForm from './form/RenderForm';
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
  FyllutAppConfig,
  FyllutEvent,
  FyllutHttp,
  FyllutHttpHeaders,
} from './context/fyllut/FyllutAppConfigContext';
export type { FyllutLanguage } from './context/fyllut/FyllutLanguageContext';
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
export type { RenderFormProps } from './form/RenderForm';
export type { SharedFrontendBoundaryProps } from './SharedFrontendBoundary';
export type { WizardController } from './wizard/useWizardController';
export {
  AppConfigProvider,
  applyPrefilledValuesToSubmission,
  buildDigitalFormSearch,
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
  FyllutAppConfigProvider,
  FyllutLanguageProvider,
  initializeSubmission,
  inputComponentRegistry,
  isSoknadAlreadyExistsResponse,
  LanguageProvider,
  RenderForm,
  RenderInputForm,
  RenderSummaryForm,
  SharedFrontendBoundary,
  sharedFrontendPackageName,
  shouldUseLegacyPageForNewRenderer,
  StepperProvider,
  SubmissionStateProvider,
  useAppConfig,
  useFormDefinition,
  useFormPersistence,
  useFyllutAppConfig,
  useFyllutLanguage,
  useLanguage,
  useSubmissionState,
  useValidation,
  useWizardController,
  ValidationExclamationIcon,
  ValidationProvider,
};

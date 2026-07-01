import FormErrorSummary from './components/error-summary/FormErrorSummary';
import ValidationExclamationIcon from './components/icons/ValidationExclamationIcon';
import { FormButtonRow, FormNextButton, FormPrevButton } from './components/layout/FormButtonRow';
import FormHeader from './components/layout/FormHeader';
import FormIcon from './components/layout/FormIcon';
import FormLayout from './components/layout/FormLayout';
import FormStepper from './components/layout/FormStepper';
import { useAppConfig } from './context/app-config/AppConfigContext';
import { useFormDefinition } from './context/form-definition/FormDefinitionContext';
import { FormFrameworkProvider } from './context/FormFrameworkProvider';
import { useLanguage } from './context/language/LanguageContext';
import { usePersistence } from './context/persistence/PersistenceContext';
import { initializeSubmission } from './context/submission-init/initializeSubmission';
import { useSubmission } from './context/submission/SubmissionContext';
import { useValidation } from './context/validation/ValidationContext';
import { inputComponentRegistry } from './form-components/inputComponentRegistry';
import RenderInputForm from './form-components/RenderInputForm';
import RenderSummaryForm from './form-components/RenderSummaryForm';
import SharedFrontendBoundary from './SharedFrontendBoundary';
import { useWizardController } from './wizard/useWizardController';

const sharedFrontendPackageName = '@navikt/skjemadigitalisering-shared-frontend';

export type { FormFrameworkProviderProps } from './context/FormFrameworkProvider';
export type {
  FormPersistenceHandlers,
  PersistenceContextType,
  PersistenceStatus,
} from './context/persistence/PersistenceContext';
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
  FormButtonRow,
  FormErrorSummary,
  FormFrameworkProvider,
  FormHeader,
  FormIcon,
  FormLayout,
  FormNextButton,
  FormPrevButton,
  FormStepper,
  initializeSubmission,
  inputComponentRegistry,
  RenderInputForm,
  RenderSummaryForm,
  SharedFrontendBoundary,
  sharedFrontendPackageName,
  useAppConfig,
  useFormDefinition,
  useLanguage,
  usePersistence,
  useSubmission,
  useValidation,
  useWizardController,
  ValidationExclamationIcon,
};

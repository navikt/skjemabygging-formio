import FormErrorSummary from './components/error-summary/FormErrorSummary';
import ValidationExclamationIcon from './components/icons/ValidationExclamationIcon';
import NavUnitSelect from './components/nav-unit-select/NavUnitSelect';
import { ApplicationProvider, useApplication } from './context/application/ApplicationContext';
import { FormDefinitionProvider, useFormDefinition } from './context/form-definition/FormDefinitionContext';
import { applyPrefilledValuesToSubmission } from './context/form-definition/prefillSubmission';
import { LanguageProvider, useLanguage } from './context/language/LanguageContext';
import { RuntimeServicesProvider, useRuntimeServices } from './context/runtime-services/RuntimeServicesContext';
import { initializeSubmission } from './context/state/initializeSubmission';
import { SubmissionStateProvider, useSubmissionState } from './context/state/SubmissionStateContext';
import { SubmissionMethodProvider, useSubmissionMethod } from './context/submission-method/SubmissionMethodContext';
import { useValidation, ValidationProvider } from './context/validation/ValidationContext';
import { RenderSummaryForm } from './form-components';
import { RenderForm } from './fyllut';
import {
  buildDigitalFormSearch,
  isSoknadAlreadyExistsResponse,
  shouldUseLegacyPageForNewRenderer,
} from './fyllut/draft/digitalDraftUtils';
import { resolveDefaultSubmissionMethod } from './fyllut/submission-method/submissionMethodResolution';
import SharedFrontendBoundary from './SharedFrontendBoundary';
import './styles/tokens.css';

const sharedFrontendPackageName = '@navikt/skjemadigitalisering-shared-frontend';

export type { NavUnitSelectProps } from './components/nav-unit-select/NavUnitSelect';
export type {
  ApplicationContextValue,
  ApplicationEnvironment,
  ApplicationLogger,
} from './context/application/ApplicationContext';
export type { LanguageConfig, LanguageContextValue } from './context/language/LanguageContext';
export type { FormCodeList, FormDataService, RuntimeServices } from './context/runtime-services/RuntimeServicesContext';
export type { FieldError, ValidationContextType } from './context/validation/ValidationContext';
export type {
  FormComponentProps,
  FormComponentRegistry,
  HandleAttachmentDownloadFile,
  RenderSummaryFormProps,
  SummaryRendererAppConfig,
  SummaryRendererConfig,
} from './form-components';
export type { FyllutContextValue, FyllutEvent, FyllutHttp, FyllutHttpHeaders, RenderFormProps } from './fyllut';
export type { SharedFrontendBoundaryProps } from './SharedFrontendBoundary';
export {
  ApplicationProvider,
  applyPrefilledValuesToSubmission,
  buildDigitalFormSearch,
  FormDefinitionProvider,
  FormErrorSummary,
  initializeSubmission,
  isSoknadAlreadyExistsResponse,
  LanguageProvider,
  NavUnitSelect,
  RenderForm,
  RenderSummaryForm,
  resolveDefaultSubmissionMethod,
  RuntimeServicesProvider,
  SharedFrontendBoundary,
  sharedFrontendPackageName,
  shouldUseLegacyPageForNewRenderer,
  SubmissionMethodProvider,
  SubmissionStateProvider,
  useApplication,
  useFormDefinition,
  useLanguage,
  useRuntimeServices,
  useSubmissionMethod,
  useSubmissionState,
  useValidation,
  ValidationExclamationIcon,
  ValidationProvider,
};

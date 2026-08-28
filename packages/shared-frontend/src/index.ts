import CountrySelect from './components/country-select/CountrySelect';
import CurrencySelect from './components/currency-select/CurrencySelect';
import FormErrorSummary from './components/error-summary/FormErrorSummary';
import ValidationExclamationIcon from './components/icons/ValidationExclamationIcon';
import NavUnitSelect from './components/nav-unit-select/NavUnitSelect';
import { useNavUnits } from './components/nav-unit-select/useNavUnits';
import { ApplicationProvider, useApplication } from './context/application/ApplicationContext';
import { FormDefinitionProvider, useFormDefinition } from './context/form-definition/FormDefinitionContext';
import { applyPrefilledValuesToSubmission } from './context/form-definition/prefillSubmission';
import { LanguageProvider, useLanguage } from './context/language/LanguageContext';
import { RuntimeServicesProvider, useRuntimeServices } from './context/runtime-services/RuntimeServicesContext';
import { initializeSubmission } from './context/state/initializeSubmission';
import { StateStoreProvider } from './context/state/StateContext';
import { SubmissionStateProvider, useSubmissionState } from './context/state/SubmissionStateContext';
import { SubmissionMethodProvider, useSubmissionMethod } from './context/submission-method/SubmissionMethodContext';
import { useValidation, ValidationProvider } from './context/validation/ValidationContext';
import { RenderSummaryForm } from './form-components';
import { applyPrefillDataToForm, getFormPrefillKeys, initializeDigitalDraft, RenderForm } from './fyllut';
import { buildDigitalFormSearch, isSoknadAlreadyExistsResponse } from './fyllut/draft/digitalDraftUtils';
import { resolveDefaultSubmissionMethod } from './fyllut/submission-method/submissionMethodResolution';
import SharedFrontendBoundary from './SharedFrontendBoundary';
import './styles/tokens.css';

const sharedFrontendPackageName = '@navikt/skjemadigitalisering-shared-frontend';

export type { CountrySelectProps } from './components/country-select/CountrySelect';
export type { CurrencySelectProps } from './components/currency-select/CurrencySelect';
export type { NavUnitSelectProps } from './components/nav-unit-select/NavUnitSelect';
export type { UseNavUnitsOptions } from './components/nav-unit-select/useNavUnits';
export type {
  ApplicationContextValue,
  ApplicationEnvironment,
  ApplicationLogger,
} from './context/application/ApplicationContext';
export type { LanguageConfig, LanguageContextValue } from './context/language/LanguageContext';
export type {
  ActiveTask,
  ApplicationService,
  AttachmentApplication,
  AttachmentService,
  CreateDraftResult,
  Draft,
  DraftRequest,
  FormCodeList,
  FormDataService,
  RuntimeServices,
  SessionService,
  SubmissionApplication,
  SubmissionService,
} from './context/runtime-services/RuntimeServicesContext';
export type { FieldStateStore } from './context/state/StateContext';
export type { FieldError, ValidationContextType } from './context/validation/ValidationContext';
export type {
  FormComponentProps,
  FormComponentRegistry,
  HandleAttachmentDownloadFile,
  RenderSummaryFormProps,
  SummaryRendererAppConfig,
  SummaryRendererConfig,
} from './form-components';
export type {
  DigitalDraftInitialization,
  FyllutContextValue,
  FyllutEvent,
  FyllutHttp,
  FyllutHttpHeaders,
  RenderFormProps,
} from './fyllut';
export type { SharedFrontendBoundaryProps } from './SharedFrontendBoundary';
export {
  ApplicationProvider,
  applyPrefillDataToForm,
  applyPrefilledValuesToSubmission,
  buildDigitalFormSearch,
  CountrySelect,
  CurrencySelect,
  FormDefinitionProvider,
  FormErrorSummary,
  getFormPrefillKeys,
  initializeDigitalDraft,
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
  StateStoreProvider,
  SubmissionMethodProvider,
  SubmissionStateProvider,
  useApplication,
  useFormDefinition,
  useLanguage,
  useNavUnits,
  useRuntimeServices,
  useSubmissionMethod,
  useSubmissionState,
  useValidation,
  ValidationExclamationIcon,
  ValidationProvider,
};

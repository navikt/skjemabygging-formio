import CountrySelect from './components/country-select/CountrySelect';
import CurrencySelect from './components/currency-select/CurrencySelect';
import FormErrorSummary from './components/error-summary/FormErrorSummary';
import ValidationExclamationIcon from './components/icons/ValidationExclamationIcon';
import NavUnitSelect from './components/nav-unit-select/NavUnitSelect';
import { useNavUnits } from './components/nav-unit-select/useNavUnits';
import { ApplicationProvider, useApplication } from './context/application/ApplicationContext';
import {
  FormDefinitionProvider,
  useFormDefinition,
  useFormDefinitionComponents,
  useFormDefinitionForm,
  useFormDefinitionPanels,
  useFormDefinitionSubmissionMethod,
} from './context/form-definition/FormDefinitionContext';
import { applyInitialValuesToSubmission } from './context/form-definition/initialSubmissionValues';
import { LanguageProvider, useLanguage } from './context/language/LanguageContext';
import { RuntimeServicesProvider, useRuntimeServices } from './context/runtime-services/RuntimeServicesContext';
import { solvePow } from './context/runtime-services/powWorker';
import { StateStoreProvider } from './context/state/StateContext';
import { SubmissionStateProvider, useSubmissionState } from './context/state/SubmissionStateContext';
import { ValidationProvider } from './context/validation/ValidationContext';
import {
  findUnsupportedCustomValidation,
  RenderSummaryForm,
  reportUnsupportedCustomValidation,
} from './form-components';
import { applyPrefillDataToForm, getFormPrefillKeys, initializeDigitalDraft, RenderForm } from './fyllut';
import { resolveDefaultSubmissionMethod } from './fyllut/submission-method/submissionMethodResolution';
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
} from './context/runtime-services/RuntimeServices';
export type { FieldStateStore } from './context/state/StateContext';
export type { FieldError, ValidationContextType } from './context/validation/ValidationContext';
export type {
  FormComponentProps,
  FormComponentRegistry,
  HandleAttachmentDownloadFile,
  RenderSummaryFormProps,
  SummaryRendererAppConfig,
  SummaryRendererConfig,
  UnsupportedCustomValidation,
} from './form-components';
export type {
  DigitalDraftInitialization,
  IntegrationContextValue,
  IntegrationEvent,
  IntegrationHttp,
  IntegrationHttpHeaders,
  RenderFormProps,
} from './fyllut';
export {
  ApplicationProvider,
  applyInitialValuesToSubmission,
  applyPrefillDataToForm,
  CountrySelect,
  CurrencySelect,
  findUnsupportedCustomValidation,
  FormDefinitionProvider,
  FormErrorSummary,
  getFormPrefillKeys,
  initializeDigitalDraft,
  LanguageProvider,
  NavUnitSelect,
  RenderForm,
  RenderSummaryForm,
  reportUnsupportedCustomValidation,
  resolveDefaultSubmissionMethod,
  RuntimeServicesProvider,
  sharedFrontendPackageName,
  solvePow,
  StateStoreProvider,
  SubmissionStateProvider,
  useApplication,
  useFormDefinition,
  useFormDefinitionComponents,
  useFormDefinitionForm,
  useFormDefinitionPanels,
  useFormDefinitionSubmissionMethod,
  useLanguage,
  useNavUnits,
  useRuntimeServices,
  useSubmissionState,
  ValidationExclamationIcon,
  ValidationProvider,
};

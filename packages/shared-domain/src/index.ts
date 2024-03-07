import { ComponentError } from './component';
import type { ConfigType } from './config';
import { Enhet, Enhetstype, supportedEnhetstyper } from './enhet';
import {
  Component,
  DeclarationType,
  DisplayType,
  FormPropertiesPublishing,
  FormPropertiesType,
  FormSignaturesType,
  FormsResponseForm,
  FyllutState,
  InnsendingType,
  MellomlagringError,
  NavFormType,
  NewFormSignatureType,
  Panel,
  PrefillData,
  PrefillKey,
  PrefillType,
  ResourceAccess,
  Submission,
  SubmissionData,
  SubmissionMethod,
  UsageContext,
} from './form';
import { ForstesideRequestBody, KjentBruker, UkjentBruker } from './forsteside';
import languagesUtil from './languages/languagesUtil';
import type {
  FormioTranslation,
  FormioTranslationData,
  FormioTranslationMap,
  FormioTranslationPayload,
  GlobalTranslationMap,
  I18nTranslationMap,
  I18nTranslations,
  Language,
  ScopedTranslationMap,
  TranslationResource,
  TranslationScope,
  TranslationTag,
} from './languages/types';
import migrationUtils, { MigrationLevel } from './migration';
import { Operator } from './migration/operator';
import type { Mottaksadresse, MottaksadresseData } from './mottaksadresse';
import type { ReportDefinition } from './reports';
import type { GlobalTranslationsResourceContent, MottaksadresserResourceContent, ResourceContent } from './resource';
import { AktivitetVedtaksinformasjon, SendInnAktivitet, VedtakBetalingsplan } from './sendinn/activity';
import { SubmissionActivity } from './submission/activity';
import { DrivingListPeriod, DrivingListSubmission, DrivingListValues } from './submission/drivingList';
import type { Summary } from './summary/FormSummaryType';
import MockedComponentObjectForTest from './summary/MockedComponentObjectForTest';
import formSummaryUtil from './summary/formSummaryUtil';
import TEXTS from './texts';
import dateUtils from './utils/date';
import featureUtils, { FeatureTogglesMap } from './utils/featureUtils';
import formDiffingTool, { NavFormSettingsDiff } from './utils/formDiffingTool';
import navFormioUtils from './utils/formio';
import { guid } from './utils/guid';
import localizationUtils from './utils/localization';
import navFormUtils, { DependencyType } from './utils/navFormUtils';
import objectUtils from './utils/objectUtils';
import paginationUtils from './utils/pagination';
import signatureUtils from './utils/signatureUtils';
import stringUtils from './utils/stringUtils';
import validatorUtils from './utils/validatorUtils';

export {
  DeclarationType,
  MockedComponentObjectForTest,
  PrefillType,
  TEXTS,
  dateUtils,
  featureUtils,
  formDiffingTool,
  formSummaryUtil,
  guid,
  languagesUtil,
  localizationUtils,
  migrationUtils,
  navFormUtils,
  navFormioUtils,
  objectUtils,
  paginationUtils,
  signatureUtils,
  stringUtils,
  supportedEnhetstyper,
  validatorUtils,
};
export type {
  AktivitetVedtaksinformasjon,
  Component,
  ComponentError,
  ConfigType,
  DependencyType,
  DisplayType,
  DrivingListPeriod,
  DrivingListSubmission,
  DrivingListValues,
  Enhet,
  Enhetstype,
  FeatureTogglesMap,
  FormPropertiesPublishing,
  FormPropertiesType,
  FormSignaturesType,
  FormioTranslation,
  FormioTranslationData,
  FormioTranslationMap,
  FormioTranslationPayload,
  FormsResponseForm,
  ForstesideRequestBody,
  FyllutState,
  GlobalTranslationMap,
  GlobalTranslationsResourceContent,
  I18nTranslationMap,
  I18nTranslations,
  InnsendingType,
  KjentBruker,
  Language,
  MellomlagringError,
  MigrationLevel,
  Mottaksadresse,
  MottaksadresseData,
  MottaksadresserResourceContent,
  NavFormSettingsDiff,
  NavFormType,
  NewFormSignatureType,
  Operator,
  Panel,
  PrefillData,
  PrefillKey,
  ReportDefinition,
  ResourceAccess,
  ResourceContent,
  ScopedTranslationMap,
  SendInnAktivitet,
  Submission,
  SubmissionActivity,
  SubmissionData,
  SubmissionMethod,
  Summary,
  TranslationResource,
  TranslationScope,
  TranslationTag,
  UkjentBruker,
  UsageContext,
  VedtakBetalingsplan,
};

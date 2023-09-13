import { Enhet, Enhetstype, supportedEnhetstyper } from "./enhet";
import {
  Component,
  DeclarationType,
  DisplayType,
  FormPropertiesPublishing,
  FormPropertiesType,
  FormSignaturesType,
  InnsendingType,
  NavFormType,
  NewFormSignatureType,
  Panel,
  Submission,
  SubmissionData,
  UsageContext,
} from "./form";
import { ForstesideRequestBody, KjentBruker, UkjentBruker } from "./forsteside";
import languagesUtil from "./languages/languagesUtil";
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
} from "./languages/types";
import type { ConfigType } from "./config";
import migrationUtils from "./migration";
import { Operator } from "./migration/operator";
import type { Mottaksadresse, MottaksadresseData } from "./mottaksadresse";
import type { ReportDefinition } from "./reports";
import type { GlobalTranslationsResourceContent, MottaksadresserResourceContent, ResourceContent } from "./resource";
import type { Summary } from "./summary/FormSummaryType";
import formSummaryUtil from "./summary/formSummaryUtil";
import MockedComponentObjectForTest from "./summary/MockedComponentObjectForTest";
import TEXTS from "./texts";
import dateUtils from "./utils/date";
import featureUtils, { FeatureTogglesMap } from "./utils/featureUtils";
import formDiffingTool, { NavFormSettingsDiff } from "./utils/formDiffingTool";
import navFormioUtils from "./utils/formio";
import { guid } from "./utils/guid";
import localizationUtils from "./utils/localization";
import navFormUtils, { DependencyType } from "./utils/navFormUtils";
import objectUtils from "./utils/objectUtils";
import paginationUtils from "./utils/pagination";
import signatureUtils from "./utils/signatureUtils";
import stringUtils from "./utils/stringUtils";
import validatorUtils from "./utils/validatorUtils";

export {
  TEXTS,
  MockedComponentObjectForTest,
  formSummaryUtil,
  navFormioUtils,
  navFormUtils,
  stringUtils,
  objectUtils,
  signatureUtils,
  localizationUtils,
  featureUtils,
  languagesUtil,
  guid,
  validatorUtils,
  dateUtils,
  migrationUtils,
  paginationUtils,
  supportedEnhetstyper,
  formDiffingTool,
  DeclarationType,
};
export type {
  DependencyType,
  FeatureTogglesMap,
  DisplayType,
  InnsendingType,
  FormSignaturesType,
  NewFormSignatureType,
  FormPropertiesType,
  FormPropertiesPublishing,
  Summary,
  NavFormType,
  SubmissionData,
  Submission,
  Component,
  Panel,
  Enhet,
  Enhetstype,
  FormioTranslationPayload,
  TranslationResource,
  FormioTranslationMap,
  I18nTranslations,
  ScopedTranslationMap,
  FormioTranslation,
  FormioTranslationData,
  GlobalTranslationMap,
  I18nTranslationMap,
  Language,
  TranslationScope,
  TranslationTag,
  MottaksadresseData,
  Mottaksadresse,
  ResourceContent,
  MottaksadresserResourceContent,
  GlobalTranslationsResourceContent,
  ForstesideRequestBody,
  KjentBruker,
  UkjentBruker,
  ReportDefinition,
  Operator,
  NavFormSettingsDiff,
  UsageContext,
  ConfigType,
};

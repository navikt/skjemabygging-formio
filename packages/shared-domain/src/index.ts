import { Enhet, Enhetstype, supportedEnhetstyper } from "./enhet";
import type {
  Component,
  DisplayType,
  FormPropertiesPublishing,
  FormPropertiesType,
  FormSignaturesType,
  InnsendingType,
  NavFormType,
  NewFormSignatureType,
  Panel,
} from "./form";
import { ForstesideRequestBody, KjentBruker, UkjentBruker } from "./forsteside";
import languagesUtil from "./languages/languagesUtil";
import type {
  FormioTranslation,
  FormioTranslationData,
  FormioTranslationMap,
  FormioTranslationPayload,
  I18nTranslationMap,
  I18nTranslations,
  Language,
  ScopedTranslationMap,
  TranslationResource,
  TranslationScope,
  TranslationTag,
} from "./languages/types";
import migrationUtils from "./migration";
import { Operator } from "./migration/operator";
import type { Mottaksadresse, MottaksadresseData } from "./mottaksadresse";
import type { ReportDefinition } from "./reports";
import type { GlobalTranslationsResourceContent, MottaksadresserResourceContent, ResourceContent } from "./resource";
import type {
  ComponentType,
  ContainerType,
  FormSummaryComponent,
  FormSummaryContainer,
  FormSummaryField,
  FormSummaryImage,
  FormSummaryPanel,
  FormSummarySelectboxes,
  SubmissionValue,
} from "./summary/FormSummaryType";
import formSummaryUtil from "./summary/formSummaryUtil";
import MockedComponentObjectForTest from "./summary/MockedComponentObjectForTest.js";
import TEXTS from "./texts";
import dateUtils from "./utils/date";
import featureUtils, { FeatureTogglesMap } from "./utils/featureUtils";
import navFormioUtils from "./utils/formio";
import { guid } from "./utils/guid";
import localizationUtils from "./utils/localization";
import navFormUtils from "./utils/navFormUtils";
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
};
export type {
  FeatureTogglesMap,
  DisplayType,
  InnsendingType,
  FormSignaturesType,
  NewFormSignatureType,
  FormPropertiesType,
  FormPropertiesPublishing,
  FormSummaryField,
  FormSummarySelectboxes,
  FormSummaryImage,
  FormSummaryContainer,
  FormSummaryComponent,
  FormSummaryPanel,
  SubmissionValue,
  ComponentType,
  ContainerType,
  NavFormType,
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
};

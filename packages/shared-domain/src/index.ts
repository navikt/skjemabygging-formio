import { Enhet, Enhetstype } from "./enhet";
import type {
  Component,
  DisplayType,
  FormPropertiesType,
  FormSignaturesType,
  InnsendingType,
  NavFormType,
  NewFormSignatureType,
} from "./form";
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
import type { MottaksadresseData, MottaksadresseEntity } from "./mottaksadresse";
import type { GlobalTranslationsResourceContent, MottaksadresserResourceContent, ResourceContent } from "./resource";
import { createFormSummaryObject } from "./summary/formSummaryUtil";
import MockedComponentObjectForTest from "./summary/MockedComponentObjectForTest.js";
import TEXTS from "./texts";
import featureUtils, { FeatureTogglesMap } from "./utils/featureUtils";
import { guid } from "./utils/guid";
import localizationUtils from "./utils/localization";
import navFormUtils from "./utils/navFormUtils";
import objectUtils from "./utils/objectUtils";
import signatureUtils from "./utils/signatureUtils";
import stringUtils from "./utils/stringUtils";
import validatorUtils from "./utils/validatorUtils";

export {
  createFormSummaryObject,
  TEXTS,
  MockedComponentObjectForTest,
  navFormUtils,
  stringUtils,
  objectUtils,
  signatureUtils,
  localizationUtils,
  featureUtils,
  languagesUtil,
  guid,
  validatorUtils,
};
export type {
  FeatureTogglesMap,
  DisplayType,
  InnsendingType,
  FormSignaturesType,
  NewFormSignatureType,
  FormPropertiesType,
  NavFormType,
  Component,
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
  MottaksadresseEntity,
  ResourceContent,
  MottaksadresserResourceContent,
  GlobalTranslationsResourceContent,
};

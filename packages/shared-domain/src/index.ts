import { Enhet, Enhetstype } from "./enhet";
import type {
  Component,
  DisplayType,
  FormPropertiesType,
  FormSignaturesType,
  InnsendingType,
  NavFormType,
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
import stringUtils from "./utils/stringUtils";

export {
  createFormSummaryObject,
  TEXTS,
  MockedComponentObjectForTest,
  navFormUtils,
  stringUtils,
  objectUtils,
  localizationUtils,
  featureUtils,
  languagesUtil,
  guid,
};
export type {
  FeatureTogglesMap,
  DisplayType,
  InnsendingType,
  FormSignaturesType,
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

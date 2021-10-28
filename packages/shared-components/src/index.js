import AmplitudeProvider from "./context/amplitude";
import { AppConfigProvider, useAppConfig } from "./configContext";
import CustomComponents from "./customComponents";
import FyllUtRouter from "./Forms/FyllUtRouter";
import { createFormSummaryObject, MockedComponentObjectForTest } from "@navikt/skjemadigitalisering-shared-domain";
import { guid } from "./util/guid";
import NavForm from "./components/NavForm";
import navFormStyle from "./components/navFormStyle";
import FormBuilderOptions from "./Forms/form-builder-options";
import FormBuilderSchemas from "./Forms/form-builder-options/schemas"
import { appStyles, globalStyles } from "./components/navGlobalStyles";
import Template from "./template";
import { LanguagesProvider, useLanguages } from "./context/languages";
import LanguageSelector from "./components/LanguageSelector";
import i18nData from "./i18nData";
import { bootstrapStyles } from "./Forms/fyllUtRouterBootstrapStyles";
import useCurrentLanguage from "./context/languages/useCurrentLanguage";
import useLanguageCodeFromURL from "./context/languages/useLanguageCodeFromURL";
import { mapTranslationsToFormioI18nObject } from "./context/languages/translationsMapper";

export {
  NavForm,
  navFormStyle,
  Template,
  FormBuilderOptions,
  FormBuilderSchemas,
  createFormSummaryObject,
  AmplitudeProvider,
  AppConfigProvider,
  useAppConfig,
  CustomComponents,
  FyllUtRouter,
  globalStyles,
  appStyles,
  bootstrapStyles,
  LanguagesProvider,
  i18nData,
  guid,
  MockedComponentObjectForTest,
  LanguageSelector,
  useLanguages,
  useCurrentLanguage,
  useLanguageCodeFromURL,
  mapTranslationsToFormioI18nObject,
};

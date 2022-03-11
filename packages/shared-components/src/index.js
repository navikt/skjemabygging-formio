import http from "./api/http";
import LanguageSelector from "./components/LanguageSelector";
import LoadingComponent from "./components/LoadingComponent";
import NavForm from "./components/NavForm";
import formioFormStyles from "./components/styles/formioFormStyles";
import navFormStyle from "./components/styles/navFormStyle";
import { appStyles, globalStyles } from "./components/styles/navGlobalStyles";
import { AppConfigProvider, useAppConfig } from "./configContext";
import AmplitudeProvider from "./context/amplitude";
import { LanguagesProvider, useLanguages } from "./context/languages";
import { mapTranslationsToFormioI18nObject } from "./context/languages/translationsMapper";
import useCurrentLanguage from "./context/languages/useCurrentLanguage";
import useLanguageCodeFromURL from "./context/languages/useLanguageCodeFromURL";
import CustomComponents from "./customComponents";
import FormBuilderOptions from "./Forms/form-builder-options";
import FormBuilderSchemas from "./Forms/form-builder-options/schemas";
import FyllUtRouter from "./Forms/FyllUtRouter";
import { bootstrapStyles } from "./Forms/fyllUtRouterBootstrapStyles";
import i18nData from "./i18nData";
import Template from "./template";
import { getIso8601String } from "./util/date";
import { guid } from "./util/guid";
import { navCssVariables } from "./util/navCssVariables";

export {
  NavForm,
  navFormStyle,
  Template,
  FormBuilderOptions,
  FormBuilderSchemas,
  AmplitudeProvider,
  AppConfigProvider,
  useAppConfig,
  CustomComponents,
  FyllUtRouter,
  globalStyles,
  appStyles,
  bootstrapStyles,
  formioFormStyles,
  LanguagesProvider,
  i18nData,
  guid,
  LanguageSelector,
  LoadingComponent,
  useLanguages,
  useCurrentLanguage,
  useLanguageCodeFromURL,
  mapTranslationsToFormioI18nObject,
  navCssVariables,
  getIso8601String,
  http,
};

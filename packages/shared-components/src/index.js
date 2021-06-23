import AmplitudeProvider from "./context/amplitude";
import { AppConfigProvider, useAppConfig } from "./configContext";
import CustomComponents from "./customComponents";
import FyllUtRouter from "./Forms/FyllUtRouter";
import { createFormSummaryObject } from "./util/formSummaryUtil";
import { guid } from "./util/guid";
import NavForm from "./components/NavForm";
import navFormStyle from "./components/navFormStyle";
import FormBuilderOptions, { FormBuilderSchemas } from "./Forms/FormBuilderOptions";
import { appStyles, globalStyles } from "./components/navGlobalStyles";
import Template from "./template";
import { combineTranslationResources } from "./context/i18n/translationsMapper";
import I18nProvider, { useTranslations, languagesInNorwegian } from "./context/i18n";
import FormBuilderLanguageSelector from "./context/i18n/FormBuilderLanguageSelector";
import { LanguagesProvider } from "./context/languages";
import i18nData from "./i18nData";
import { flattenComponents } from "./util/forsteside";
import MockedComponentObjectForTest from "./util/MockedComponentObjectForTest.js";

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
  combineTranslationResources,
  useTranslations,
  languagesInNorwegian,
  I18nProvider,
  FormBuilderLanguageSelector,
  LanguagesProvider,
  i18nData,
  guid,
  flattenComponents,
  MockedComponentObjectForTest,
};

import { guid } from "@navikt/skjemadigitalisering-shared-domain";
import jss from "jss";
import preset from "jss-preset-default";
import FyllUtRouter from "./Forms/FyllUtRouter";
import FormBuilderOptions from "./Forms/form-builder-options";
import FormBuilderSchemas from "./Forms/form-builder-options/schemas";
import http, { FetchHeader, FetchOptions } from "./api/http";
import ErrorPage from "./components/ErrorPage";
import LanguageSelector from "./components/LanguageSelector";
import LoadingComponent from "./components/LoadingComponent";
import NavForm from "./components/NavForm";
import Modal from "./components/modal/Modal";
import { AppConfigProvider, useAppConfig } from "./configContext";
import AmplitudeProvider from "./context/amplitude";
import { LanguagesProvider, useLanguages } from "./context/languages";
import { mapTranslationsToFormioI18nObject } from "./context/languages/translationsMapper";
import useCurrentLanguage from "./context/languages/useCurrentLanguage";
import useLanguageCodeFromURL from "./context/languages/useLanguageCodeFromURL";
import CustomComponents from "./customComponents";
import i18nData from "./i18nData";
import Styles from "./styles";
import Template from "./template";
import * as formUtils from "./util/form.js";
import makeStyles from "./util/jss";
import { navCssVariables } from "./util/navCssVariables";
import url from "./util/url";

jss.setup(preset());

export {
  Styles,
  makeStyles,
  NavForm,
  Template,
  FormBuilderOptions,
  FormBuilderSchemas,
  AmplitudeProvider,
  AppConfigProvider,
  useAppConfig,
  CustomComponents,
  FyllUtRouter,
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
  http,
  url,
  formUtils,
  ErrorPage,
  Modal,
};
export type { FetchHeader, FetchOptions };

import { guid } from '@navikt/skjemadigitalisering-shared-domain';
import jss from 'jss';
import preset from 'jss-preset-default';
import type { FetchHeader, FetchOptions } from './api/util/http/http';
import http from './api/util/http/http';
import ErrorPage from './components/error/page/ErrorPage';
import LanguageSelector from './components/language-selector/LanguageSelector';
import LoadingComponent from './components/loading/LoadingComponent';
import Modal from './components/modal/Modal';
import ConfirmationModal from './components/modal/confirmation/ConfirmationModal';
import useModal from './components/modal/useModal';
import NavForm from './components/nav-form/NavForm';
import AmplitudeProvider from './context/amplitude';
import { AppConfigProvider, useAppConfig } from './context/config/configContext';
import { LanguagesProvider, useLanguages } from './context/languages';
import useCurrentLanguage from './context/languages/hooks/useCurrentLanguage';
import useLanguageCodeFromURL from './context/languages/hooks/useLanguageCodeFromURL';
import { mapTranslationsToFormioI18nObject } from './context/languages/mapper/translationsMapper';
import FormBuilderOptions from './formio/form-builder-options';
import FormBuilderSchemas from './formio/form-builder-options/schemas';
import './formio/overrides';
import FyllUtRouter from './pages/FyllUtRouter';
import Styles from './styles';
import * as formUtils from './util/form/form.js';
import NavFormioJs from './util/formio/formiojs';
import htmlAsJsonUtils, { HtmlAsJsonElement, HtmlAsJsonTextElement } from './util/htmlAsJson';
import makeStyles from './util/styles/jss/jss';
import { navCssVariables } from './util/styles/nav-css/navCssVariables';
import i18nData from './util/translation/i18nData';
import url from './util/url/url';

jss.setup(preset());

export {
  AmplitudeProvider,
  AppConfigProvider,
  ConfirmationModal,
  ErrorPage,
  FormBuilderOptions,
  FormBuilderSchemas,
  FyllUtRouter,
  LanguageSelector,
  LanguagesProvider,
  LoadingComponent,
  Modal,
  NavForm,
  NavFormioJs,
  Styles,
  formUtils,
  guid,
  htmlAsJsonUtils,
  http,
  i18nData,
  makeStyles,
  mapTranslationsToFormioI18nObject,
  navCssVariables,
  url,
  useAppConfig,
  useCurrentLanguage,
  useLanguageCodeFromURL,
  useLanguages,
  useModal,
};
export type { FetchHeader, FetchOptions, HtmlAsJsonElement, HtmlAsJsonTextElement };

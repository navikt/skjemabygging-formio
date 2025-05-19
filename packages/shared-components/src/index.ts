import { guid } from '@navikt/skjemadigitalisering-shared-domain';
import jss from 'jss';
import preset from 'jss-preset-default';
import type { FetchHeader, FetchOptions } from './api/util/http/http';
import http from './api/util/http/http';
import ButtonWithSpinner from './components/button/ButtonWithSpinner';
import ErrorPage from './components/error/page/ErrorPage';
import { FormContainer } from './components/form/container/FormContainer';
import { FormTitle } from './components/form/form-title/FormTitle';
import InnerHtml from './components/inner-html/InnerHtml';
import LinkButton from './components/link-button/LinkButton';
import LoadingComponent from './components/loading/LoadingComponent';
import SkeletonList from './components/loading/SkeletonList';
import Modal from './components/modal/Modal';
import ConfirmationModal from './components/modal/confirmation/ConfirmationModal';
import useModal from './components/modal/useModal';
import NavForm from './components/nav-form/NavForm';
import { AppConfigProvider, useAppConfig } from './context/config/configContext';
import { LanguageSelector, LanguagesProvider, useLanguages } from './context/languages';
import useCurrentLanguage from './context/languages/hooks/useCurrentLanguage';
import useLanguageCodeFromURL from './context/languages/hooks/useLanguageCodeFromURL';
import { mapTranslationsToFormioI18nObject } from './context/languages/mapper/translationsMapper';
import FormBuilderOptions from './formio/form-builder-options';
import FormBuilderSchemas from './formio/form-builder-options/schemas';
import './formio/overrides';
import FyllUtRouter from './pages/FyllUtRouter';
import Styles from './styles';
import { getCountries } from './util/countries/countries';
import * as formUtils from './util/form/form.js';
import NavFormioJs from './util/formio/formiojs';
import htmlUtils from './util/html/htmlUtils';
import i18nUtils from './util/i18n';
import listSort from './util/list/sort';
import makeStyles from './util/styles/jss/jss';
import { navCssVariables } from './util/styles/nav-css/navCssVariables';
import url from './util/url/url';

jss.setup(preset());

export {
  AppConfigProvider,
  ButtonWithSpinner,
  ConfirmationModal,
  ErrorPage,
  FormBuilderOptions,
  FormBuilderSchemas,
  FormContainer,
  FormTitle,
  formUtils,
  FyllUtRouter,
  getCountries,
  guid,
  htmlUtils,
  http,
  i18nUtils,
  InnerHtml,
  LanguageSelector,
  LanguagesProvider,
  LinkButton,
  listSort,
  LoadingComponent,
  makeStyles,
  mapTranslationsToFormioI18nObject,
  Modal,
  navCssVariables,
  NavForm,
  NavFormioJs,
  SkeletonList,
  Styles,
  url,
  useAppConfig,
  useCurrentLanguage,
  useLanguageCodeFromURL,
  useLanguages,
  useModal,
};
export type { FetchHeader, FetchOptions };

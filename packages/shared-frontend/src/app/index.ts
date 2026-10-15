import { AppConfigProvider, useAppConfig } from './config/AppConfigProvider';
import {
  ErrorBoundary,
  ErrorPage,
  ErrorPageLayout,
  FrontPageButton,
  MyPageLink,
  navUrls,
  NotFoundContent,
  ReportBugLink,
  ServerErrorContent,
  SessionExpiredMessage,
  UnavailablePage,
} from './error';
import http from './http/http';
import { getAkselLocale } from './language/akselLocale';
import { getAvailableLanguages, getCurrentLanguage, resolveActiveLanguage } from './language/languageUtils';
import { UrlLanguageSelector } from './language/UrlLanguageSelector';
import { FormContainer } from './layout/FormContainer';
import SkeletonList from './loading/SkeletonList';
import FrontendLogger from './logger/FrontendLogger';

export type { AppConfigContextValue } from './config/AppConfigProvider';
export type { ErrorContentProps } from './error';
export type { FetchHeader, FetchOptions } from './http/http';
export type { LoggerConfig } from './logger/FrontendLogger';
export {
  AppConfigProvider,
  ErrorBoundary,
  ErrorPage,
  ErrorPageLayout,
  FormContainer,
  FrontendLogger,
  FrontPageButton,
  getAkselLocale,
  getAvailableLanguages,
  getCurrentLanguage,
  http,
  MyPageLink,
  navUrls,
  NotFoundContent,
  ReportBugLink,
  resolveActiveLanguage,
  ServerErrorContent,
  SessionExpiredMessage,
  SkeletonList,
  UnavailablePage,
  UrlLanguageSelector,
  useAppConfig,
};

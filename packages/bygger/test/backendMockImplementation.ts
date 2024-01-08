import testForm from '../example_data/Form.json';
import loginForm from '../example_data/LoginForm.json';
import mottaksadresse from '../example_data/mottaksadresse.json';
import mottaksadresser from '../example_data/mottaksadresser.json';

const RESPONSE_HEADERS = {
  headers: {
    'content-type': 'application/json',
  },
};

const translations = [{ data: { i18n: { ja: 'yes' }, language: 'en', scope: 'global' } }];
const countriesWithLocale = {
  en: [
    { label: 'Norway', value: 'NO' },
    { label: 'Sweden', value: 'SE' },
  ],
  nb: [
    { label: 'Norge', value: 'NO' },
    { label: 'Sverige', value: 'SE' },
  ],
};

const USER_LOGIN_REGEX = /http.*\/user\/login/;
const FORM_REGEX = /http.*\/form\?type=form(&.*)?/;
const ALL_FORMS_REGEX = /\/api\/forms\\?.+/;
const BYGGER_BACKEND_FORM_REGEX = /\/api\/forms\/(.+)/;
const RESOURCE_REGEX = /http.*\/form\?type=resource(&.*)?/;
const LANGUAGES_REGEX = /http.*\/language\/submission(\?.*)?$/;
const LANGUAGE_REGEX = /http.*\/language\/submission\/(.*)$/;
const COUNTRIES_REGEX = /http.*\/countries\??lang=(.*)$/;
const MOTTAKSADRESSER_REGEX = /http.*\/mottaksadresse\/submission/;
const MOTTAKSADRESSE_REGEX = /http.*\/mottaksadresse$/;
const TEMAKODER_REGEX = /http.*\/api\/temakoder/;
const FORM_DIFF = /http.*\/form\/.*\/diff/;

export const DEFAULT_PROJECT_URL = 'http://myproject.example.org';

const defaultParams = {
  projectUrl: DEFAULT_PROJECT_URL,
};

type FetchOptions = {
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'OPTIONS' | 'DELETE';
};

const createMockImplementation =
  ({ projectUrl } = defaultParams) =>
  (url, options: FetchOptions = {}) => {
    if (projectUrl === url) {
      return Promise.resolve(new Response(JSON.stringify({ builder: {} }), RESPONSE_HEADERS));
    }
    if (USER_LOGIN_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify(loginForm), RESPONSE_HEADERS));
    }
    if (BYGGER_BACKEND_FORM_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify(testForm), RESPONSE_HEADERS));
    }
    if (ALL_FORMS_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify([testForm]), RESPONSE_HEADERS));
    }
    if (FORM_REGEX.test(url)) {
      if (/mottaksadresseId=mockDeleteId/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
      }
      return Promise.resolve(new Response(JSON.stringify([testForm]), RESPONSE_HEADERS));
    }
    if (RESOURCE_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
    }
    if (LANGUAGES_REGEX.test(url)) {
      if (options.method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify({ _id: '_translationId' }), RESPONSE_HEADERS));
      }
      return Promise.resolve(new Response(JSON.stringify(translations), RESPONSE_HEADERS));
    }
    if (LANGUAGE_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS));
    }
    if (MOTTAKSADRESSER_REGEX.test(url)) {
      if (options.method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify(mottaksadresser[0]), RESPONSE_HEADERS));
      }
      if (options.method === 'PUT') {
        return Promise.resolve(new Response(JSON.stringify(mottaksadresser[0]), RESPONSE_HEADERS));
      }
      if (options.method === 'DELETE') {
        return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS));
      }
      return Promise.resolve(new Response(JSON.stringify(mottaksadresser), RESPONSE_HEADERS));
    }
    if (MOTTAKSADRESSE_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify(mottaksadresse), RESPONSE_HEADERS));
    }
    if (TEMAKODER_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify({ TEST: 'test' }), RESPONSE_HEADERS));
    }
    if (COUNTRIES_REGEX.test(url)) {
      const matches = COUNTRIES_REGEX.exec(url);
      if (matches) {
        const lang = matches[1];
        return Promise.resolve(new Response(JSON.stringify(countriesWithLocale[lang]), RESPONSE_HEADERS));
      }
    }
    if (FORM_DIFF.test(url)) {
      return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
    }

    return Promise.reject(new Error(`Missing test implementation: ${url} (${JSON.stringify(options)})`));
  };

export default createMockImplementation;

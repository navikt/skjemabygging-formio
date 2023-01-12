import testForm from "../example_data/Form.json";
import loginForm from "../example_data/LoginForm.json";

const RESPONSE_HEADERS = {
  headers: {
    "content-type": "application/json",
  },
};

const translations = [{ data: { i18n: { ja: "yes" }, language: "en", scope: "global" } }];
const countriesWithLocale = {
  en: [
    { label: "Norway", value: "NO" },
    { label: "Sweden", value: "SE" },
  ],
  nb: [
    { label: "Norge", value: "NO" },
    { label: "Sverige", value: "SE" },
  ],
};

const GET_USER_LOGIN_REGEX = /http.*\/user\/login/;
const GET_FORM_REGEX = /http.*\/form\?type=form(&.*)?/;
const GET_RESOURCE_REGEX = /http.*\/form\?type=resource(&.*)?/;
const GET_LANGUAGES_REGEX = /http.*\/language\/submission(\?.*)?$/;
const GET_LANGUAGE_REGEX = /http.*\/language\/submission\/(.*)$/;
const GET_COUNTRIES_REGEX = /http.*\/countries\??lang=(.*)$/;
const GET_MOTTAKSADRESSER_REGEX = /http.*\/mottaksadresse\/submission/;
const GET_TEMAKODER_REGEX = /http.*\/api\/temakoder/;
const GET_FORM_DIFF = /http.*\/form\/.*\/diff/;

const DEFAULT_PROJECT_URL = "http://myproject.example.org";

const defaultParams = {
  projectUrl: DEFAULT_PROJECT_URL,
};

type FetchOptions = {
  headers?: Record<string, string>;
  method?: "GET" | "POST" | "PUT" | "OPTIONS" | "DELETE";
};

const createMockImplementation =
  ({ projectUrl } = defaultParams) =>
  (url, options: FetchOptions = {}) => {
    if (projectUrl === url) {
      return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS));
    }
    if (GET_USER_LOGIN_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify(loginForm), RESPONSE_HEADERS));
    }
    if (GET_FORM_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify([testForm]), RESPONSE_HEADERS));
    }
    if (GET_RESOURCE_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
    }
    if (GET_LANGUAGES_REGEX.test(url)) {
      if (options.method === "POST") {
        return Promise.resolve(new Response(JSON.stringify({ _id: "_translationId" }), RESPONSE_HEADERS));
      }
      return Promise.resolve(new Response(JSON.stringify(translations), RESPONSE_HEADERS));
    }
    if (GET_LANGUAGE_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS));
    }
    if (GET_MOTTAKSADRESSER_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
    }
    if (GET_TEMAKODER_REGEX.test(url)) {
      return Promise.resolve(new Response(JSON.stringify({ TEST: "test" }), RESPONSE_HEADERS));
    }
    if (GET_COUNTRIES_REGEX.test(url)) {
      const matches = GET_COUNTRIES_REGEX.exec(url);
      if (matches) {
        const lang = matches[1];
        return Promise.resolve(new Response(JSON.stringify(countriesWithLocale[lang]), RESPONSE_HEADERS));
      }
    }
    if (GET_FORM_DIFF.test(url)) {
      return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
    }

    return Promise.reject(new Error(`Missing test implementation: ${url} (${JSON.stringify(options)})`));
  };

export default createMockImplementation;

import prodForms from './prod/forms';

const RESPONSE_HEADERS_OK = {
  headers: {
    'content-type': 'application/json',
  },
  status: 200,
};

const RESPONSE_HEADERS_ERROR = {
  headers: {
    'content-type': 'text/plain',
  },
  status: 500,
};

const FORM_REGEX = /\/api\/import\/forms\/(.+)$/;
export const mockImplementation = (url) => {
  const stringUrl = url as string;
  if (FORM_REGEX.test(stringUrl)) {
    const matches = FORM_REGEX.exec(stringUrl);
    if (matches) {
      const path = matches[1];
      const form = prodForms.find((f) => f.path === path) || {};
      const responseHeaders = path !== 'nav123455' ? RESPONSE_HEADERS_OK : RESPONSE_HEADERS_ERROR;
      return Promise.resolve(new Response(JSON.stringify(form), responseHeaders));
    }
  }
  if (stringUrl.endsWith('/import/source-forms')) {
    return Promise.resolve(new Response(JSON.stringify(prodForms), RESPONSE_HEADERS_OK));
  }
  throw new Error(`Manglende testoppsett: Ukjent url ${url}`);
};

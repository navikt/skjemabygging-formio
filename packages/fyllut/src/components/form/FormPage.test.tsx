import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import FormPage from './FormPage';

const RESPONSE_HEADERS = {
  headers: {
    'content-type': 'application/json',
  },
};

const form = {
  title: 'Testskjema',
  path: 'testskjema',
  components: [{ type: 'panel', key: 'veiledning' }],
  properties: {
    submissionTypes: [],
  },
};

const translations = {
  en: {
    Testskjema: 'Test form',
  },
};

describe('FormPage', () => {
  beforeEach(() => {
    fetchMock.doMock();
  });

  const renderFormPage = (form, featureToggles = {}) => {
    render(
      <MemoryRouter>
        <AppConfigProvider featureToggles={featureToggles} config={{}}>
          <FormPage form={form} />
        </AppConfigProvider>
      </MemoryRouter>,
    );
  };

  describe('Language selector', () => {
    it('is not rendered if no translations are available', async () => {
      fetchMock.mockImplementation((url, _options) => {
        if (url === '/fyllut/api/translations/testskjema') {
          return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS));
        }
        if (typeof url === 'string' && url.startsWith('/fyllut/api/countries')) {
          return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
        }
        if (typeof url === 'string' && url.startsWith('/fyllut/api/global-translations')) {
          return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS));
        }
        return Promise.reject(new Error(`Ukjent url: ${url}`));
      });

      renderFormPage(form);

      expect(await screen.findByRole('heading', { name: 'Testskjema' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Norsk bokmål' })).not.toBeInTheDocument();
    });

    it('allows selection of other language for the form', async () => {
      fetchMock.mockImplementation((url, _options) => {
        if (url === '/fyllut/api/translations/testskjema') {
          return Promise.resolve(new Response(JSON.stringify(translations), RESPONSE_HEADERS));
        }
        if (typeof url === 'string' && url.startsWith('/fyllut/api/countries')) {
          return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
        }
        if (typeof url === 'string' && url.startsWith('/fyllut/api/global-translations')) {
          return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS));
        }
        return Promise.reject(new Error(`Ukjent url: ${url}`));
      });

      renderFormPage(form);

      expect(await screen.findByRole('heading', { name: 'Testskjema' })).toBeInTheDocument();
      const languageSelector = await screen.findByRole('button', { name: 'Norsk bokmål' });
      expect(languageSelector).toBeInTheDocument();
      await userEvent.click(languageSelector);
      await userEvent.click(await screen.findByRole('link', { name: 'English' }));
      expect(await screen.findByRole('heading', { name: 'Test form' })).toBeInTheDocument();
    });
  });
});

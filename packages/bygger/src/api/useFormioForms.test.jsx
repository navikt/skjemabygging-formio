import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { getNodeText, render, renderHook, screen, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { FeedbackEmitContext } from '../context/notifications/FeedbackContext.js';
import { useFormioForms } from './useFormioForms.js';

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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('useFormioForms', () => {
  let mockFeedbackEmit;

  beforeEach(() => {
    mockFeedbackEmit = { success: vi.fn(), error: vi.fn() };
  });

  afterEach(() => {
    fetchMock.mockClear();
  });

  const TestComponent = ({ formPath }) => {
    const { loadForm, loadFormsList } = useFormioForms();
    const [forms, setForms] = useState([]);
    useEffect(() => {
      if (formPath) {
        loadForm(formPath).then((form) => setForms([form]));
      } else {
        loadFormsList().then((forms) => setForms(forms));
      }
    }, [formPath, loadForm, loadFormsList]);
    return (
      <>
        {forms.map((form, index) => (
          <div key={index} data-testid="form">
            {form.title}
          </div>
        ))}
      </>
    );
  };

  describe('Test form', () => {
    beforeEach(() => {
      const forms = [
        { title: 'skjema1', path: 'skjema1', tags: 'nav-skjema', properties: {}, modified: '', _id: '000' },
        { title: 'skjema2', path: 'skjema2', tags: 'nav-skjema', properties: {}, modified: '', _id: '012' },
        { title: 'skjema3', path: 'skjema3', tags: 'nav-skjema', properties: {}, modified: '', _id: '023' },
      ];

      const form = [
        { title: 'skjema3', path: 'skjema3', tags: 'nav-skjema', properties: {}, modified: '', _id: '023' },
      ];
      fetchMock.mockImplementation((url) => {
        if (url.includes('/api/forms?')) {
          return Promise.resolve(new Response(JSON.stringify(forms), RESPONSE_HEADERS_OK));
        }
        if (url.includes('/api/forms/skjema3')) {
          return Promise.resolve(new Response(JSON.stringify(form[0]), RESPONSE_HEADERS_OK));
        }
        return Promise.reject(new Error(`ukjent url ${url}`));
      });
    });

    afterEach(() => {
      fetchMock.mockClear();
    });

    const renderTestComponent = (formPath) => {
      render(
        <AppConfigProvider>
          <TestComponent formPath={formPath} />
        </AppConfigProvider>,
      );
    };

    it('loads form list in the hook', async () => {
      renderTestComponent();
      const formDivs = await screen.findAllByTestId('form');
      expect(formDivs).toHaveLength(3);
      expect(getNodeText(formDivs[0])).toBe('skjema1');
      expect(getNodeText(formDivs[1])).toBe('skjema2');
      expect(getNodeText(formDivs[2])).toBe('skjema3');
    });

    it('loads one specific form in the hook', async () => {
      renderTestComponent('skjema3');
      const formDivs = await screen.findAllByTestId('form');
      expect(formDivs).toHaveLength(1);
      expect(getNodeText(formDivs[0])).toBe('skjema3');
    });

    it('date update', async () => {
      renderTestComponent('skjema3');
      const formDivs = await screen.findAllByTestId('form');
      expect(formDivs).toHaveLength(1);
      expect(getNodeText(formDivs[0])).toBe('skjema3');
    });
  });

  describe('Test onSave', () => {
    let formioForms;

    const wrapper = ({ children }) => <AppConfigProvider>{children}</AppConfigProvider>;

    beforeEach(() => {
      fetchMock.mockImplementation((url, options) => {
        if (url === '/api/forms/testform' && options.method === 'PUT') {
          return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS_OK));
        }
        return Promise.reject(new Error(`ukjent url ${url}`));
      });

      ({
        result: { current: formioForms },
      } = renderHook(() => useFormioForms(), { wrapper }));
    });

    it('resets display property to wizard', async () => {
      renderHook(() => formioForms.onSave({ path: 'testform', display: 'form' }));

      expect(fetchMock).toHaveBeenCalled();
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body || '{}');
      expect(requestBody.display).toBe('wizard');
    });
  });

  describe('Test onPublish and onUnpublish', () => {
    let formioForms;

    const wrapper = ({ children }) => (
      <AppConfigProvider>
        <FeedbackEmitContext.Provider value={mockFeedbackEmit}>{children}</FeedbackEmitContext.Provider>
      </AppConfigProvider>
    );

    beforeEach(() => {
      ({
        result: { current: formioForms },
      } = renderHook(() => useFormioForms(), { wrapper }));
    });

    describe('when publishing succeeds', () => {
      beforeEach(() => {
        fetchMock.mockImplementation((url) => {
          if (url.endsWith('/api/published-forms/testform')) {
            return Promise.resolve(new Response(JSON.stringify({ changed: true, form: {} }), RESPONSE_HEADERS_OK));
          }
          return Promise.reject(new Error(`ukjent url ${url}`));
        });
      });

      it('flashes success message', async () => {
        renderHook(() => formioForms.onPublish({ path: 'testform', properties: {} }));
        await waitFor(() => expect(mockFeedbackEmit.success).toHaveBeenCalled());
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('sends form content and published languages array in request', async () => {
        const form = { path: 'testform', properties: {} };
        const translations = { 'no-NN': {}, en: {} };
        renderHook(() => formioForms.onPublish(form, translations));
        await waitFor(() => expect(mockFeedbackEmit.success).toHaveBeenCalled());

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const publishRequestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
        const publishedForm = publishRequestBody.form;
        const publishedTranslations = publishRequestBody.translations;
        expect(publishedForm).toEqual(form);
        expect(publishedTranslations).toEqual(translations);
      });
    });

    describe('when publishing fails', () => {
      beforeEach(() => {
        fetchMock.mockImplementation((url) => {
          if (url.endsWith('/api/published-forms/testform')) {
            return Promise.resolve(
              new Response(JSON.stringify({ message: 'Publisering feilet' }), RESPONSE_HEADERS_ERROR),
            );
          } else if (url.includes('/api/forms/testform')) {
            return Promise.resolve(new Response(JSON.stringify({ path: 'testform' }), RESPONSE_HEADERS_OK));
          }
          return Promise.reject(new Error(`ukjent url ${url}`));
        });
      });

      it('flashes error message and loads form from formio-api', async () => {
        const originalModifiedTimestamp = '2022-05-30T07:58:40.929Z';
        const form = {
          path: 'testform',
          properties: {
            modified: originalModifiedTimestamp,
          },
        };
        const translations = { 'no-NN': {}, en: {} };
        renderHook(() => formioForms.onPublish(form, translations));
        await waitFor(() => expect(mockFeedbackEmit.error).toHaveBeenCalled());
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      });
    });

    describe('when unpublishing succeeds', () => {
      beforeEach(() => {
        fetchMock.mockImplementation((url) => {
          if (url.endsWith('/api/published-forms/testform')) {
            return Promise.resolve(new Response(JSON.stringify({ changed: true, form: {} }), RESPONSE_HEADERS_OK));
          } else if (url.includes('/api/forms/testform')) {
            return Promise.resolve(new Response(JSON.stringify({ path: 'testform' }), RESPONSE_HEADERS_OK));
          }
          return Promise.reject(new Error(`ukjent url ${url}`));
        });
      });

      it('flashes success message', async () => {
        renderHook(() => formioForms.onUnpublish({ path: 'testform', properties: {} }));
        await waitFor(() => expect(mockFeedbackEmit.success).toHaveBeenCalled());
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('when unpublishing fails', () => {
      beforeEach(() => {
        fetchMock.mockImplementation((url) => {
          if (url.endsWith('/api/published-forms/testform')) {
            return Promise.resolve(
              new Response(JSON.stringify({ message: 'Avpublisering feilet' }), RESPONSE_HEADERS_ERROR),
            );
          } else if (url.includes('/api/forms/testform')) {
            return Promise.resolve(new Response(JSON.stringify({ path: 'testform' }), RESPONSE_HEADERS_OK));
          }
          return Promise.reject(new Error(`ukjent url ${url}`));
        });
      });

      it('flashes error message and loads form from formio-api', async () => {
        const originalModifiedTimestamp = '2022-05-30T07:58:40.929Z';
        const form = {
          path: 'testform',
          properties: {
            modified: originalModifiedTimestamp,
          },
        };
        renderHook(() => formioForms.onUnpublish(form));
        await waitFor(() => expect(mockFeedbackEmit.error).toHaveBeenCalled());
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      });
    });
  });
});

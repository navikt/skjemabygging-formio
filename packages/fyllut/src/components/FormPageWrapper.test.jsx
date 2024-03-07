import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import httpFyllut from '../util/httpFyllut';
import { FormPageWrapper } from './FormPageWrapper';

const RESPONSE_HEADERS = {
  headers: {
    'content-type': 'application/json',
  },
};

describe('FormPageWrapper', () => {
  beforeEach(() => {
    console.log = vi.fn();
    fetchMock.doMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Show loading when fetching a form from backend and no form founded when there is no form fetched', async () => {
    fetchMock.mockImplementation((url) => {
      if (url === '/fyllut/api/forms/unknownForm') {
        return Promise.resolve(new Response('', { status: 404 }));
      }
      if (url.startsWith('/fyllut/api/translations')) {
        return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS));
      }
      throw new Error('Unknown URL: ' + url);
    });

    render(
      <MemoryRouter initialEntries={['/fyllut/unknownForm']}>
        <AppConfigProvider featureToggles={{}} config={{}} http={httpFyllut}>
          <Routes>
            <Route path="/fyllut/:formPath/*" element={<FormPageWrapper />} />
          </Routes>
        </AppConfigProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Laster...',
      }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Fant ikke siden' })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe(''));
  });

  it('Show target form when there is one', async () => {
    const mockedForm = {
      _id: '000',
      path: 'newform',
      title: 'New form',
      modified: '2021-11-30T14:10:21.487Z',
      components: [],
      properties: {},
    };
    fetchMock.mockImplementation((url) => {
      console.log(url);
      if (url === '/fyllut/api/forms/knownForm') {
        return Promise.resolve(new Response(JSON.stringify(mockedForm), RESPONSE_HEADERS));
      }
      if (url.startsWith('/fyllut/api/translations')) {
        return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS));
      }
      throw new Error('Unknown URL: ' + url);
    });

    render(
      <MemoryRouter initialEntries={['/fyllut/knownForm']}>
        <AppConfigProvider featureToggles={{}} config={{}} http={httpFyllut}>
          <Routes>
            <Route path="/fyllut/:formPath/*" element={<FormPageWrapper />} />
          </Routes>
        </AppConfigProvider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(document.title).toBe('New form | www.nav.no'));
  });

  describe('Submission method', () => {
    const mockedForm = {
      _id: '007',
      path: 'nav123456',
      title: 'Testskjema',
      modified: '2021-11-30T14:10:21.487Z',
      components: [],
      properties: {
        innsending: 'KUN_PAPIR',
      },
    };

    beforeEach(() => {
      fetchMock.mockImplementation((url) => {
        if (url === '/fyllut/api/forms/nav123456') {
          return Promise.resolve(new Response(JSON.stringify(mockedForm), RESPONSE_HEADERS));
        }
        if (url.startsWith('/fyllut/api/translations')) {
          return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS));
        }
        throw new Error('Unknown URL: ' + url);
      });
    });

    it('Show error message when submission method is invalid', async () => {
      render(
        <MemoryRouter initialEntries={['/fyllut/nav123456']}>
          <AppConfigProvider featureToggles={{}} config={{}} submissionMethod="digital" http={httpFyllut}>
            <Routes>
              <Route path="/fyllut/:formPath/*" element={<FormPageWrapper />} />
            </Routes>
          </AppConfigProvider>
        </MemoryRouter>,
      );
      await waitFor(() =>
        expect(screen.queryByRole('heading', { name: 'Ugyldig innsendingsvalg' })).toBeInTheDocument(),
      );
      expect(screen.queryByRole('heading', { name: mockedForm.title })).not.toBeInTheDocument();
    });

    it('Show form title when submission method is valid', async () => {
      render(
        <MemoryRouter initialEntries={['/fyllut/nav123456']}>
          <AppConfigProvider featureToggles={{}} config={{}} submissionMethod="paper" http={httpFyllut}>
            <Routes>
              <Route path="/fyllut/:formPath/*" element={<FormPageWrapper />} />
            </Routes>
          </AppConfigProvider>
        </MemoryRouter>,
      );
      await waitFor(() => expect(screen.queryByRole('heading', { name: mockedForm.title })).toBeInTheDocument());
      expect(screen.queryByRole('heading', { name: 'Ugyldig innsendingsvalg' })).not.toBeInTheDocument();
    });
  });
});

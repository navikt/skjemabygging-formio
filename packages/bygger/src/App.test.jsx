import { AppConfigProvider, NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import createMockImplementation, { DEFAULT_PROJECT_URL } from '../test/backendMockImplementation';
import featureToggles from '../test/featureToggles';
import App from './App';
import { AuthContext } from './context/auth-context';

const createFakeChannel = () => ({
  bind: vi.fn(),
  unbind: vi.fn(),
});

describe('App', () => {
  let formioFetch;

  beforeEach(() => {
    formioFetch = vi.spyOn(NavFormioJs.Formio, 'fetch');
    formioFetch.mockImplementation(createMockImplementation());
  });

  afterEach(() => {
    formioFetch.mockClear();
  });

  const renderApp = (appConfigProps = {}) => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthContext.Provider
          value={{
            userData: null,
            login: () => {},
          }}
        >
          <AppConfigProvider featureToggles={featureToggles} {...appConfigProps}>
            <App projectURL={DEFAULT_PROJECT_URL} pusher={{ subscribe: () => createFakeChannel() }} />
          </AppConfigProvider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
  };

  // TODO FORMS-API delete or fix?
  // eslint-disable-next-line mocha/no-skipped-tests
  test.skip('Show login form in development', async () => {
    renderApp({ config: { isDevelopment: true } });
    expect(await screen.findByLabelText('Email', { exact: false })).toBeTruthy();
    expect(await screen.findByLabelText('Password', { exact: false })).toBeTruthy();
  });

  test('Do not show login form when not development', async () => {
    renderApp({ config: { isDevelopment: false } });
    expect(await screen.findByText('Vennligst vent, du logges ut...')).toBeTruthy();
    expect(screen.queryByLabelText('Email', { exact: false })).toBeNull();
    expect(screen.queryByLabelText('Password', { exact: false })).toBeNull();
  });
});

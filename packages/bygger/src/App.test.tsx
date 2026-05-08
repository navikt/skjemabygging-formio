import { AppConfigProvider, NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import createMockImplementation from '../test/backendMockImplementation';
import featureToggles from '../test/featureToggles';
import App from './App';
import { AuthContext } from './context/auth-context';

describe('App', () => {
  let formioFetch;

  beforeEach(() => {
    formioFetch = vi.spyOn(NavFormioJs.Formio, 'fetch');
    formioFetch.mockImplementation(createMockImplementation() as never);
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
            <App />
          </AppConfigProvider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
  };

  test('Do not show login form when not development', async () => {
    renderApp({ config: { isDevelopment: false } });
    expect(await screen.findByText('Vennligst vent, du logges ut...')).toBeTruthy();
    expect(screen.queryByLabelText('Email', { exact: false })).toBeNull();
    expect(screen.queryByLabelText('Password', { exact: false })).toBeNull();
  });
});

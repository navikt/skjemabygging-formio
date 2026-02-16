import { AppConfigProvider, LanguagesProvider } from '@navikt/skjemadigitalisering-shared-components';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { MockInstance } from 'vitest';
import createMockImplementation, { DEFAULT_PROJECT_URL } from '../../test/backendMockImplementation';
import featureToggles from '../../test/featureToggles';
import AuthenticatedApp from '../AuthenticatedApp';
import { AuthContext } from '../context/auth-context';
import FeedbackProvider from '../context/notifications/FeedbackContext';

describe('FormsRouter', () => {
  let fetchSpy: MockInstance;
  const projectUrl = 'http://test.example.org';

  beforeAll(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
    fetchSpy.mockImplementation(createMockImplementation({ projectUrl }));
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });

  function renderApp(pathname: string) {
    return render(
      <MemoryRouter initialEntries={[pathname]}>
        <AuthContext.Provider
          value={{
            userData: { name: 'fakeUser', isAdmin: true },
            login: () => {},
          }}
        >
          <FeedbackProvider>
            <AppConfigProvider featureToggles={featureToggles} baseUrl={DEFAULT_PROJECT_URL}>
              <LanguagesProvider translations={{}}>
                <AuthenticatedApp serverURL={DEFAULT_PROJECT_URL} />
              </LanguagesProvider>
            </AppConfigProvider>
          </FeedbackProvider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
  }

  it('lets you navigate to new form page from the list of all forms', async () => {
    renderApp('/forms');
    const knapp = await screen.findByRole('link', { name: 'Nytt skjema' });
    await userEvent.click(knapp);
    expect(await screen.findByRole('button', { name: 'Opprett' })).toBeInTheDocument();
  });

  it('can edit a form', async () => {
    renderApp('/forms/debugskjema/edit');
    expect(await screen.findByRole('heading', { name: 'debug skjema' })).toBeInTheDocument();
    expect(screen.getByLabelText('Text Area', { exact: false })).toBeInTheDocument();
  });

  it('navigates from the list to the editor', async () => {
    renderApp('/forms');
    const link = await screen.findByText('debug skjema');
    await userEvent.click(link);
    expect(await screen.findByRole('heading', { name: 'debug skjema' })).toBeInTheDocument();
    expect(await screen.findByLabelText('Text Area', { exact: false })).toBeInTheDocument();
  });
});

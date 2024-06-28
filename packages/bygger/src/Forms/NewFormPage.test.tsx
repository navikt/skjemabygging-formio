import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType, ResourceAccess } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Mock } from 'vitest';
import mockMottaksadresser from '../../example_data/mottaksadresser.json';
import featureToggles from '../../test/featureToggles';
import FeedbackProvider from '../context/notifications/FeedbackContext';
import NewFormPage from './NewFormPage';

const RESPONSE_HEADERS = {
  headers: {
    'content-type': 'application/json',
  },
};

interface Config {
  formioRoleIds: {
    administrator?: string;
    authenticated?: string;
    everyone?: string;
  };
}

const mockTemaKoder = { ABC: 'Tema 1', XYZ: 'Tema 3', DEF: 'Tema 2' };

const renderNewFormPage = (formio: { saveForm: () => void }, config: Partial<Config> = DEFAULT_CONFIG) => {
  render(
    <FeedbackProvider>
      <MemoryRouter>
        <AppConfigProvider featureToggles={featureToggles} config={config}>
          <NewFormPage formio={formio} />
        </AppConfigProvider>
      </MemoryRouter>
    </FeedbackProvider>,
  );
};

describe('NewFormPage', () => {
  beforeEach(() => {
    fetchMock.mockImplementation((url) => {
      const stringUrl = url as string;
      if (stringUrl.endsWith('/mottaksadresse/submission')) {
        return Promise.resolve(new Response(JSON.stringify(mockMottaksadresser), RESPONSE_HEADERS));
      }
      if (stringUrl.endsWith('/temakoder')) {
        return Promise.resolve(new Response(JSON.stringify(mockTemaKoder), RESPONSE_HEADERS));
      }
      throw new Error(`Manglende testoppsett: Ukjent url ${url}`);
    });
  });

  it('should create a new form with correct path, title and name', async () => {
    const saveForm = vi.fn(() => Promise.resolve(new Response(JSON.stringify({}))));
    renderNewFormPage({ saveForm });

    await waitFor(() => screen.getByText('Opprett nytt skjema'));
    await userEvent.type(screen.getByLabelText('Skjemanummer'), 'NAV 10-20.30 ');
    await userEvent.type(screen.getByLabelText('Tittel'), 'Et testskjema');
    await userEvent.selectOptions(screen.getByLabelText('Tema'), 'ABC');
    await userEvent.click(screen.getByRole('button', { name: 'Opprett' }));

    expect(saveForm).toHaveBeenCalledTimes(1);
    const savedForm = (saveForm as Mock).mock.calls[0][0] as NavFormType;
    expect(savedForm).toMatchObject({
      type: 'form',
      path: 'nav102030',
      display: 'wizard',
      name: 'nav102030',
      title: 'Et testskjema',
      tags: ['nav-skjema', ''],
      properties: {
        skjemanummer: 'NAV 10-20.30',
        tema: 'ABC',
      },
    });
  });

  it('should handle exception from saveForm, with message to user', async () => {
    const saveForm = vi.fn(() => Promise.reject(new Error('Form.io feil')));
    console.error = vi.fn();
    renderNewFormPage({ saveForm });

    await screen.findByText('Opprett nytt skjema');
    await userEvent.type(screen.getByLabelText('Skjemanummer'), 'NAV 10-20.30 ');
    await userEvent.type(screen.getByLabelText('Tittel'), 'Et testskjema');
    await userEvent.selectOptions(screen.getByLabelText('Tema'), 'ABC');
    await userEvent.click(screen.getByRole('button', { name: 'Opprett' }));

    expect(saveForm).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(console.error).toHaveBeenCalledTimes(1));

    expect(await screen.findByText('Det valgte skjema-nummeret er allerede i bruk.')).toBeInTheDocument();
  });

  it('should set correct access roles', async () => {
    const saveForm = vi.fn(() => Promise.resolve(new Response(JSON.stringify({}))));
    renderNewFormPage({ saveForm });

    await waitFor(() => screen.getByText('Opprett nytt skjema'));
    await userEvent.type(screen.getByLabelText('Skjemanummer'), 'NAV 12-34.56');
    await userEvent.type(screen.getByLabelText('Tittel'), 'Tester access array');
    await userEvent.selectOptions(screen.getByLabelText('Tema'), 'DEF');
    await userEvent.click(screen.getByRole('button', { name: 'Opprett' }));

    expect(saveForm).toHaveBeenCalledTimes(1);
    const savedForm = (saveForm as Mock).mock.calls[0][0] as NavFormType;
    expect(savedForm.access).toHaveLength(2);
    const findAccessObject = (access: ResourceAccess[], type: string) => access.find((a) => a.type === type)!.roles;
    const readAllRoles = findAccessObject(savedForm.access!, 'read_all');
    expect(readAllRoles).toEqual(['3']);
    const updateAllRoles = findAccessObject(savedForm.access!, 'update_all');
    expect(updateAllRoles).toEqual(['1', '2']);
  });

  it('should throw exception if role is unknown', async () => {
    console.error = vi.fn();
    const saveForm = vi.fn(() => Promise.resolve(new Response(JSON.stringify({}))));
    const config = {
      formioRoleIds: {
        authenticated: DEFAULT_CONFIG.formioRoleIds.authenticated,
        everyone: DEFAULT_CONFIG.formioRoleIds.everyone,
      },
    };
    renderNewFormPage({ saveForm }, config);

    await waitFor(() => screen.getByText('Opprett nytt skjema'));
    await userEvent.type(screen.getByLabelText('Skjemanummer'), 'NAV 12-34.56');
    await userEvent.type(screen.getByLabelText('Tittel'), 'Tester access array');
    await userEvent.selectOptions(screen.getByLabelText('Tema'), 'DEF');
    await userEvent.click(screen.getByRole('button', { name: 'Opprett' }));

    expect(await screen.findByText('Opprettelse av skjema feilet')).toBeInTheDocument();
    await waitFor(() => expect(console.error).toHaveBeenCalledTimes(1));
    expect(saveForm).toHaveBeenCalledTimes(0);
  });

  it('should throw exception if formioRoleIds are missing', async () => {
    console.error = vi.fn();
    const saveForm = vi.fn(() => Promise.resolve(new Response(JSON.stringify({}))));
    const config = {
      formioRoleIds: undefined,
    };
    renderNewFormPage({ saveForm }, config);

    await waitFor(() => screen.getByText('Opprett nytt skjema'));
    await userEvent.type(screen.getByLabelText('Skjemanummer'), 'NAV 12-34.56');
    await userEvent.type(screen.getByLabelText('Tittel'), 'Tester access array');
    await userEvent.selectOptions(screen.getByLabelText('Tema'), 'DEF');
    await userEvent.click(screen.getByRole('button', { name: 'Opprett' }));

    expect(await screen.findByText('Opprettelse av skjema feilet')).toBeInTheDocument();
    await waitFor(() => expect(console.error).toHaveBeenCalledTimes(1));
    expect(saveForm).toHaveBeenCalledTimes(0);
  });
});

const MOCK_FORMIO_ROLE_IDS = {
  administrator: '1',
  authenticated: '2',
  everyone: '3',
};

const DEFAULT_CONFIG = {
  formioRoleIds: MOCK_FORMIO_ROLE_IDS,
};

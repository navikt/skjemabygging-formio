import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType, ResourceAccess } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import mockMottaksadresser from '../../example_data/mottaksadresser.json';
import featureToggles from '../../test/featureToggles';
import FeedbackProvider from '../context/notifications/FeedbackContext';
import NewFormPage from './NewFormPage';

const RESPONSE_HEADERS = {
  headers: {
    'content-type': 'application/json',
  },
};

const mockTemaKoder = { ABC: 'Tema 1', XYZ: 'Tema 3', DEF: 'Tema 2' };

const loadRoles = () => Promise.resolve(MOCK_FORMIO_ROLES);

const renderNewFormPage = (formio: { saveForm: Function; loadRoles: Function }) => {
  render(
    <FeedbackProvider>
      <MemoryRouter>
        <AppConfigProvider featureToggles={featureToggles}>
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
    renderNewFormPage({ saveForm, loadRoles });

    await waitFor(() => screen.getByText('Opprett nytt skjema'));
    await userEvent.type(screen.getByLabelText('Skjemanummer'), 'NAV 10-20.30 ');
    await userEvent.type(screen.getByLabelText('Tittel'), 'Et testskjema');
    await userEvent.selectOptions(screen.getByLabelText('Tema'), 'ABC');
    await userEvent.click(screen.getByRole('button', { name: 'Opprett' }));

    expect(saveForm).toHaveBeenCalledTimes(1);
    // @ts-ignore
    const savedForm = saveForm.mock.calls[0][0] as NavFormType;
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
    renderNewFormPage({ saveForm, loadRoles });

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
    renderNewFormPage({ saveForm, loadRoles });

    await waitFor(() => screen.getByText('Opprett nytt skjema'));
    await userEvent.type(screen.getByLabelText('Skjemanummer'), 'NAV 12-34.56');
    await userEvent.type(screen.getByLabelText('Tittel'), 'Tester access array');
    await userEvent.selectOptions(screen.getByLabelText('Tema'), 'DEF');
    await userEvent.click(screen.getByRole('button', { name: 'Opprett' }));

    expect(saveForm).toHaveBeenCalledTimes(1);
    // @ts-ignore
    const savedForm = saveForm.mock.calls[0][0] as NavFormType;
    expect(savedForm.access).toHaveLength(2);
    const findAccessObject = (access: ResourceAccess[], type: string) => access.find((a) => a.type === type)!.roles;
    const readAllRoles = findAccessObject(savedForm.access!, 'read_all');
    expect(readAllRoles).toEqual(['000000000000000000000000']);
    const updateAllRoles = findAccessObject(savedForm.access!, 'update_all');
    expect(updateAllRoles).toEqual(['1', '3']);
  });
});

const MOCK_FORMIO_ROLES = [
  {
    _id: '1',
    title: 'Administrator',
    description: 'A role for Administrative Users.',
    machineName: 'abc:administrator',
  },
  {
    _id: '2',
    title: 'Anonymous',
    description: 'A role for Anonymous Users.',
    machineName: 'abc:anonymous',
  },
  {
    _id: '3',
    title: 'Authenticated',
    description: 'A role for Authenticated Users.',
    machineName: 'abc:authenticated',
  },
];

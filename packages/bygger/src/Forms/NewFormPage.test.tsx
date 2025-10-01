import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
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

const mockTemaKoder = { ABC: 'Tema 1', XYZ: 'Tema 3', DEF: 'Tema 2' };

const createFormMock = vi.fn().mockImplementation(() => Promise.resolve());
vi.mock('../api/useForms', () => {
  return {
    default: () => ({
      createForm: createFormMock,
    }),
  };
});

const renderNewFormPage = () => {
  render(
    <FeedbackProvider>
      <MemoryRouter>
        <AppConfigProvider featureToggles={featureToggles}>
          <NewFormPage />
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
    createFormMock.mockReset();
  });

  it('should create a new form with correct path, title and name', async () => {
    renderNewFormPage();

    await waitFor(() => screen.getByText('Opprett nytt skjema'));
    await userEvent.type(screen.getByLabelText('Skjemanummer'), 'NAV 10-20.30 ');
    await userEvent.type(screen.getByLabelText('Tittel'), 'Et testskjema');
    await userEvent.selectOptions(screen.getByLabelText('Tema'), 'ABC');
    await userEvent.click(screen.getByRole('button', { name: 'Opprett' }));

    expect(createFormMock).toHaveBeenCalledTimes(1);
    const savedForm = (createFormMock as Mock).mock.calls[0][0] as NavFormType;
    expect(savedForm).toMatchObject({
      name: 'nav102030',
      path: 'nav102030',
      skjemanummer: 'NAV 10-20.30',
      properties: {
        skjemanummer: 'NAV 10-20.30',
        tema: 'ABC',
      },
      title: 'Et testskjema',
    });
  });
});

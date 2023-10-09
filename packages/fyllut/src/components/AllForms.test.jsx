import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AllForms } from './AllForms';

const RESPONSE_HEADERS = {
  headers: {
    'content-type': 'application/json',
  },
};

describe('AllForms', () => {
  beforeEach(() => {
    fetchMock.doMock();
  });

  it('Show loading when fetching forms from backend and show find no forms when there is no form fetched', async () => {
    fetchMock.mockImplementation((_url) => {
      return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
    });

    render(
      <MemoryRouter initialEntries={['/fyllut']}>
        <AllForms />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Laster...' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Finner ingen skjemaer' })).toBeInTheDocument();
  });

  it('Show form lists when there are forms', async () => {
    const mockedForm = [
      { _id: '000', path: 'newform', title: 'New form', modified: '2021-11-30T14:10:21.487Z', properties: {} },
      {
        _id: '111',
        path: 'testnewform',
        title: 'Test new form',
        modified: '2021-11-29T14:10:21.487Z',
        properties: { innsending: 'KUN_DIGITAL' },
      },
    ];
    fetchMock.mockImplementation((_url) => {
      return Promise.resolve(new Response(JSON.stringify(mockedForm), RESPONSE_HEADERS));
    });

    render(
      <MemoryRouter initialEntries={['/fyllut']}>
        <AllForms />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Velg et skjema' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'New form' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Test new form' })).toBeInTheDocument();
  });
});

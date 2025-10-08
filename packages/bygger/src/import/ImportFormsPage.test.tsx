import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import ImportFormsPage from './ImportFormsPage';
import { mockImplementation } from './testdata/fetch-mock-implementation';

describe('ImportFormsPage', () => {
  beforeEach(() => {
    fetchMock.mockImplementation(mockImplementation);
  });

  const renderImportFormsPage = () => {
    render(
      <MemoryRouter>
        <AppConfigProvider featureToggles={{}} config={{}}>
          <ImportFormsPage />
        </AppConfigProvider>
      </MemoryRouter>,
    );
  };

  const clickOption = async (label: string, expectSelected = true) => {
    const formOption = await screen.findByRole('option', { name: label });
    await userEvent.click(formOption);
    if (expectSelected) {
      await screen.findByRole('button', { name: `${label} slett` });
    }
  };

  it('imports selected form', async () => {
    renderImportFormsPage();

    const combobox = await screen.findByLabelText('Søk etter skjema:');
    await userEvent.type(combobox, 'Testskjema 2');
    await clickOption('NAV 12-34.52 Testskjema 2');

    await userEvent.click(screen.getByRole('button', { name: 'Importer' }));
    const summaryTable = await screen.findByTitle('Resultat');
    expect(within(summaryTable).getAllByRole('row')).toHaveLength(2); // includes header row
    expect(within(summaryTable).getByRole('row', { name: 'NAV 12-34.52 Testskjema 2 ok' })).toBeInTheDocument();
  });

  it('imports selected forms', async () => {
    renderImportFormsPage();

    const combobox = await screen.findByLabelText('Søk etter skjema:');
    await userEvent.type(combobox, 'testskjema');
    await clickOption('NAV 12-34.52 Testskjema 2');
    await clickOption('NAV 12-34.52 Testskjema 2', false); // <- unselect
    await clickOption('NAV 12-34.51 Testskjema 1');
    await clickOption('NAV 12-34.53 Testskjema 3');

    await userEvent.click(screen.getByRole('button', { name: 'Importer' }));
    const summaryTable = await screen.findByTitle('Resultat');
    expect(within(summaryTable).getAllByRole('row')).toHaveLength(3); // includes header row
    expect(within(summaryTable).getByRole('row', { name: 'NAV 12-34.51 Testskjema 1 ok' })).toBeInTheDocument();
    expect(within(summaryTable).getByRole('row', { name: 'NAV 12-34.53 Testskjema 3 ok' })).toBeInTheDocument();
  });

  it('reports failure during import of form', async () => {
    renderImportFormsPage();

    const combobox = await screen.findByLabelText('Søk etter skjema:');
    await userEvent.click(combobox);
    await clickOption('NAV 12-34.55 Femte tittel 5');

    await userEvent.click(screen.getByRole('button', { name: 'Importer' }));
    const summaryTable = await screen.findByTitle('Resultat');
    expect(within(summaryTable).getAllByRole('row')).toHaveLength(2); // includes header row
    expect(within(summaryTable).getByRole('row', { name: 'NAV 12-34.55 Femte tittel 5 feilet' })).toBeInTheDocument();
  });
});

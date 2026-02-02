import { Operator } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, getAllByLabelText, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DryRunResults, FormMigrationLogData } from '../../types/migration';
import FeedbackProvider from '../context/notifications/FeedbackContext';
import MigrationPage from './MigrationPage';
import { TestId } from './components/MigrationOptionsForm';
import { migrationOptionsAsMap } from './utils';

describe('MigrationPage', () => {
  let fetchSpy;

  const expectedGetOptions = {
    headers: { 'content-type': 'application/json' },
    method: 'GET',
  };

  const defaultdryRunResponse: FormMigrationLogData = {
    skjemanummer: 'form',
    title: 'Skjema',
    name: 'form',
    path: 'form',
    found: 0,
    changed: 0,
    dependencies: {},
    diff: [{ key: '1', label: 'label', id: '123', property: { _ORIGINAL: 'original value', _NEW: 'new value' } }],
  };
  const dryRunResponse: DryRunResults = {
    form1: {
      ...defaultdryRunResponse,
      skjemanummer: 'form1',
      path: 'form1',
      name: 'form1',
      title: 'Skjema 1',
      found: 2,
      changed: 1,
    },
    form2: {
      ...defaultdryRunResponse,
      skjemanummer: 'form2',
      path: 'form2',
      name: 'form2',
      title: 'Skjema 2',
      found: 1,
      changed: 0,
    },
    form3: {
      ...defaultdryRunResponse,
      skjemanummer: 'form3',
      path: 'form3',
      name: 'form3',
      title: 'Skjema 3',
      found: 3,
      changed: 2,
    },
  };

  const wrapper = ({ children }) => (
    <FeedbackProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </FeedbackProvider>
  );

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(dryRunResponse), {
          headers: {
            'content-type': 'application/json',
          },
        }),
      ),
    );
    render(<MigrationPage />, { wrapper });
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });

  const setMigrateOptionInput = (optionType: TestId, index, prop, value, operator?: Operator) => {
    const migrationOptions = screen.getByTestId(optionType);
    const propertyField = getAllByLabelText(migrationOptions, 'Feltnavn')[index];
    if (propertyField) fireEvent.change(propertyField, { target: { value: prop } });
    const valueField = getAllByLabelText(migrationOptions, 'Verdi')[index];
    if (valueField) fireEvent.change(valueField, { target: { value } });
    if (operator) {
      const operatorField = getAllByLabelText(migrationOptions, 'Operator')[index];
      if (operatorField) fireEvent.change(operatorField, { target: { value: operator } });
    }
  };

  const clickAddButton = (optionType: TestId) => {
    fireEvent.click(within(screen.getByTestId(optionType)).getByTestId('add-button'));
  };

  it('renders the main heading', () => {
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Søk og migrer');
  });

  it('renders options form for search filters and edit options', () => {
    expect(screen.getByRole('heading', { level: 2, name: 'Komponenten må oppfylle følgende' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Nye verdier for felter i komponenten' })).toBeInTheDocument();
  });

  describe('Migration dry run', () => {
    it('performs a search with the provided search filters', async () => {
      setMigrateOptionInput('search-filters', 0, 'searchFilter1', true);
      fireEvent.click(screen.getByRole('button', { name: 'Simuler og kontroller migrering' }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={"searchFilter1":true}&migrationLevel=component',
        expectedGetOptions,
      );
    });

    it('performs a search with several search filters', async () => {
      setMigrateOptionInput('search-filters', 0, 'prop1', true);
      clickAddButton('search-filters');
      setMigrateOptionInput('search-filters', 1, 'prop2', 99);
      clickAddButton('search-filters');
      setMigrateOptionInput('search-filters', 2, 'prop3', false);
      fireEvent.click(screen.getByRole('button', { name: 'Simuler og kontroller migrering' }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={"prop1":true,"prop2":99,"prop3":false}&migrationLevel=component',
        expectedGetOptions,
      );
    });

    it('performs a search with operators', async () => {
      setMigrateOptionInput('search-filters', 0, 'prop1', 'hello', 'n_eq');
      clickAddButton('search-filters');
      setMigrateOptionInput('search-filters', 1, 'prop2', 'world!', 'eq');
      clickAddButton('search-filters');
      setMigrateOptionInput('search-filters', 2, 'prop3', true);
      fireEvent.click(screen.getByRole('button', { name: 'Simuler og kontroller migrering' }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={"prop1__n_eq":"hello","prop2":"world!","prop3":true}&migrationLevel=component',
        expectedGetOptions,
      );
    });

    it('performs a migration dryrun with several edit options', async () => {
      setMigrateOptionInput('search-filters', 0, 'prop1', false);
      setMigrateOptionInput('edit-options', 0, 'prop1', true);
      clickAddButton('edit-options');
      setMigrateOptionInput('edit-options', 1, 'prop2', 99);
      clickAddButton('edit-options');
      setMigrateOptionInput('edit-options', 2, 'prop3', false);
      fireEvent.click(screen.getByRole('button', { name: 'Simuler og kontroller migrering' }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={"prop1":false}&editOptions={"prop1":true,"prop2":99,"prop3":false}&migrationLevel=component',
        expectedGetOptions,
      );
    });

    it('performs a migration dryrun with search filters and edit options', async () => {
      setMigrateOptionInput('search-filters', 0, 'prop1', true);
      setMigrateOptionInput('edit-options', 0, 'prop1', false);
      clickAddButton('edit-options');
      setMigrateOptionInput('edit-options', 1, 'prop2', 'new value');
      fireEvent.click(screen.getByRole('button', { name: 'Simuler og kontroller migrering' }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?searchFilters={"prop1":true}&editOptions={"prop1":false,"prop2":"new value"}&migrationLevel=component',
        expectedGetOptions,
      );
    });

    it('performs a migration dryrun with form search filters and edit options', async () => {
      fireEvent.click(
        within(screen.getByRole('radiogroup', { name: 'Migreringsnivå' })).getByRole('radio', { name: 'Skjema' }),
      );
      setMigrateOptionInput('form-search-filters', 0, 'properties.tema', 'BIL');
      setMigrateOptionInput('edit-options', 0, 'properties.innsending', 'PAPIR_OG_DIGITAL');
      clickAddButton('edit-options');
      setMigrateOptionInput('edit-options', 1, 'prop2', 'new value');
      fireEvent.click(screen.getByRole('button', { name: 'Simuler og kontroller migrering' }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/migrate?formSearchFilters={"properties.tema":"BIL"}&editOptions={"properties.innsending":"PAPIR_OG_DIGITAL","prop2":"new value"}&migrationLevel=form',
        expectedGetOptions,
      );
    });
  });

  describe('Migration dry run results', () => {
    beforeEach(async () => {
      setMigrateOptionInput('search-filters', 0, 'prop1', true);
      setMigrateOptionInput('edit-options', 0, 'prop1', false);
      fireEvent.click(screen.getByRole('button', { name: 'Simuler og kontroller migrering' }));
      await waitFor(() => fetchSpy.mock.calls.length > 0);
    });

    it('displays the number of components that will be affected by migration', async () => {
      expect(screen.getByText('Fant 3 skjemaer som matcher søkekriteriene.')).toBeTruthy();
      expect(screen.getByText('Totalt vil 3 av 6 komponenter bli påvirket av endringene.')).toBeTruthy();
    });

    describe('Preview button', () => {
      it('is rendered for each form', () => {
        const previewLinks = screen.getAllByRole('link', { name: 'Forhåndsvis' });
        const actualSearchParams = '?searchFilters={"prop1":true}&editOptions={"prop1":false}&migrationLevel=component';
        expect(previewLinks).toHaveLength(3);
        expect(previewLinks[0]).toHaveAttribute('href', `/migrering/forhandsvis/form3${actualSearchParams}`);
        expect(previewLinks[1]).toHaveAttribute('href', `/migrering/forhandsvis/form1${actualSearchParams}`);
        expect(previewLinks[2]).toHaveAttribute('href', `/migrering/forhandsvis/form2${actualSearchParams}`);
      });
    });
  });

  describe('Migration button', () => {
    it('is not displayed until a dry run has been performed', () => {
      expect(screen.queryByRole('Button', { name: 'Migrer' })).toBeNull();
    });

    describe('onClick', () => {
      beforeEach(async () => {
        setMigrateOptionInput('search-filters', 0, 'prop1', true);
        setMigrateOptionInput('edit-options', 0, 'prop1', false);
        fireEvent.click(screen.getByRole('button', { name: 'Simuler og kontroller migrering' }));
        await waitFor(() => fetchSpy.mock.calls.length > 0);
        fireEvent.click(screen.getAllByLabelText('Inkluder i migrering')[1]);
        fireEvent.click(screen.getByRole('button', { name: 'Migrer' }));
        const selectForMigration = await screen.findAllByRole('checkbox', { name: 'Inkluder i migrering' });
        selectForMigration[0].click();
        selectForMigration[1].click();
      });

      it('opens a modal with info on which forms have been selected for migration', () => {
        const modal = screen.getByRole('dialog');
        const tables = within(modal).getAllByRole('table');
        expect(screen.getByText('Skjemaer som vil bli migrert')).toBeTruthy();
        expect(within(tables[0]).getAllByRole('row')[1]).toHaveTextContent('Skjema 3');
        expect(screen.getByText('Skjemaer som ikke vil bli migrert')).toBeTruthy();
        expect(within(tables[1]).getAllByRole('row')[1]).toHaveTextContent('Skjema 1');
        expect(
          screen.getByText('Skjemaer som matcher søkekriteriene, men ikke er aktuelle for migrering'),
        ).toBeTruthy();
        expect(within(tables[2]).getAllByRole('row')[1]).toHaveTextContent('Skjema 2');
      });

      it('sends a POST request with instructions for the migration', async () => {
        const modal = screen.getByRole('dialog');
        const confirmMigrationButton = within(modal).getByRole('button', { name: 'Bekreft migrering' });
        fireEvent.click(confirmMigrationButton);
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(fetchSpy).toHaveBeenCalledWith('/api/migrate/update', {
          body: JSON.stringify({
            payload: {
              formSearchFilters: {},
              searchFilters: { prop1: true },
              dependencyFilters: {},
              editOptions: { prop1: false },
              migrationLevel: 'component',
              include: ['form3'],
            },
          }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        });
      });
    });
  });

  describe('migrationOptionsAsMap', () => {
    it('standard mapping', () => {
      const map = migrationOptionsAsMap({
        '1': {
          key: 'k1',
          value: 'v1',
        },
        '2': {
          key: 'k2',
          value: 'v2',
        },
      });
      expect(Object.keys(map).length).toBe(2);
    });

    it('duplicate key ignored', () => {
      const map = migrationOptionsAsMap({
        '1': {
          key: 'k1',
          value: 'v1',
        },
        '2': {
          key: 'k1',
          value: 'v1',
        },
      });
      expect(Object.keys(map).length).toBe(1);
    });
  });
});

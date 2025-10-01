import { Button, Heading, Pagination, ToggleGroup } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form, MigrationLevel, paginationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { FormMigrationLogData } from '../../types/migration';
import UserFeedback from '../components/UserFeedback';
import Column from '../components/layout/Column';
import { runMigrationDryRun, runMigrationWithUpdate } from './api';
import BulkPublishPanel from './components/BulkPublishPanel';
import ConfirmMigration from './components/ConfirmMigration';
import FormEditInput from './components/FormEditInput';
import MigrationDryRunResults from './components/MigrationDryRunResults';
import MigrationOptionsForm from './components/MigrationOptionsForm';
import { reducer } from './components/MigrationOptionsForm.reducer';
import SearchFilterInput from './components/SearchFilterInput';
import {
  createEditOptions,
  createSearchFiltersFromParams,
  createUrlParams,
  getMigrationLevelFromParams,
  getUrlParamMap,
  migrationOptionsAsMap,
  searchFiltersAsParams,
  sortAndFilterResults,
} from './utils';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    maxWidth: '80rem',
    margin: '0 auto 4rem auto',
  },
  mainContent: {
    flexDirection: 'column',
    flex: '5',
  },
  sideColumn: {
    flexDirection: 'column',
    flex: '1',
    marginLeft: '2rem',
  },
  hasMarginBottom: {
    marginBottom: '2rem',
  },
  hasMarginLeft: {
    marginLeft: '1rem',
  },
  searchFilterInputs: {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr 3fr 0.2fr',
    gap: '0.25rem 1rem',
  },
  formEditInputs: {
    display: 'grid',
    gridTemplateColumns: '3fr 3fr 0.2fr',
    gap: '0.25rem 1rem',
  },
  pagination: {
    display: 'flex',
    marginTop: '2rem',
    justifyContent: 'center',
  },
});

const MigrationPage = () => {
  const styles = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [{ dryRunSearchResults, numberOfComponentsFound, numberOfComponentsChanged }, setDryRunSearchResults] =
    useState<{
      dryRunSearchResults?: FormMigrationLogData[];
      numberOfComponentsFound?: number;
      numberOfComponentsChanged?: number;
    }>({});
  const [selectedToMigrate, setSelectedToMigrate] = useState<string[]>([]);
  const [migratedForms, setMigratedForms] = useState<Form[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const MAX_ITEMS_PER_PAGE = 20;
  const totalNumberOfPages = Math.ceil((dryRunSearchResults || []).length / MAX_ITEMS_PER_PAGE);
  const resultsForCurrentPage = useMemo(
    () => paginationUtils.retrieveRangeOfList(dryRunSearchResults || [], currentPage, MAX_ITEMS_PER_PAGE),
    [dryRunSearchResults, currentPage],
  );

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formSearchFilters, dispatchFormSearchFilters] = useReducer(reducer, {}, () =>
    createSearchFiltersFromParams(getUrlParamMap(searchParams, 'formSearchFilters')),
  );
  const [searchFilters, dispatchSearchFilters] = useReducer(reducer, {}, () =>
    createSearchFiltersFromParams(getUrlParamMap(searchParams, 'searchFilters')),
  );
  const [dependencyFilters, dispatchDependencyFilters] = useReducer(reducer, {}, () =>
    createSearchFiltersFromParams(getUrlParamMap(searchParams, 'dependencyFilters')),
  );
  const [editInputs, dispatchEditInputs] = useReducer(reducer, {}, () =>
    createEditOptions(getUrlParamMap(searchParams, 'editOptions')),
  );

  const [migrationLevel, setMigrationLevel] = useState(getMigrationLevelFromParams(searchParams));

  const onSearch = async () => {
    setIsLoading(true);
    const results = await runMigrationDryRun(
      formSearchFilters,
      searchFilters,
      dependencyFilters,
      editInputs,
      migrationLevel,
    );
    const dryRunSearchResults = sortAndFilterResults(results);
    setDryRunSearchResults({
      dryRunSearchResults,
      ...dryRunSearchResults.reduce(
        (acc, curr) => ({
          numberOfComponentsFound: acc.numberOfComponentsFound + curr.found,
          numberOfComponentsChanged: acc.numberOfComponentsChanged + curr.changed,
        }),
        {
          numberOfComponentsFound: 0,
          numberOfComponentsChanged: 0,
        },
      ),
    });

    setIsLoading(false);
    navigate({
      search: createUrlParams(formSearchFilters, searchFilters, dependencyFilters, editInputs, migrationLevel),
    });
  };

  const onConfirm = async () => {
    const updatedForms = await runMigrationWithUpdate({
      formSearchFilters: searchFiltersAsParams(formSearchFilters),
      searchFilters: searchFiltersAsParams(searchFilters),
      dependencyFilters: searchFiltersAsParams(dependencyFilters),
      editOptions: migrationOptionsAsMap(editInputs),
      migrationLevel,
      include: selectedToMigrate,
    });
    setMigratedForms(updatedForms);
    setDryRunSearchResults({});
  };

  useEffect(() => {
    (async () => {
      if (
        searchParams.get('formSearchFilters') ||
        searchParams.get('searchFilters') ||
        searchParams.get('editOptions')
      ) {
        await onSearch();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className={styles.root}>
      <div className={styles.mainContent}>
        <Heading level="1" size="xlarge">
          Søk og migrer
        </Heading>
        <ToggleGroup
          title="Migreringsnivå"
          defaultValue={migrationLevel}
          onChange={(value) => {
            setMigrationLevel(value as MigrationLevel);
            setDryRunSearchResults({});
            dispatchFormSearchFilters({ type: 'clear' });
            dispatchSearchFilters({ type: 'clear' });
            dispatchDependencyFilters({ type: 'clear' });
            dispatchEditInputs({ type: 'clear' });
          }}
          className={styles.hasMarginBottom}
        >
          <ToggleGroup.Item value="component">Komponent</ToggleGroup.Item>
          <ToggleGroup.Item value="form">Skjema</ToggleGroup.Item>
        </ToggleGroup>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await onSearch();
          }}
        >
          <MigrationOptionsForm
            title="Skjemaet må oppfylle følgende"
            addRowText="Legg til filter"
            dispatch={dispatchFormSearchFilters}
            testId="form-search-filters"
          >
            <div className={styles.searchFilterInputs}>
              {Object.keys(formSearchFilters).map((id) => (
                <SearchFilterInput
                  key={id}
                  id={id}
                  searchFilter={formSearchFilters[id]}
                  dispatch={dispatchFormSearchFilters}
                ></SearchFilterInput>
              ))}
            </div>
          </MigrationOptionsForm>
          {migrationLevel === 'component' && (
            <>
              <MigrationOptionsForm
                title="Komponenten må oppfylle følgende"
                addRowText="Legg til filter"
                dispatch={dispatchSearchFilters}
                testId="search-filters"
              >
                <div className={styles.searchFilterInputs}>
                  {Object.keys(searchFilters).map((id) => (
                    <SearchFilterInput
                      key={id}
                      id={id}
                      searchFilter={searchFilters[id]}
                      dispatch={dispatchSearchFilters}
                    ></SearchFilterInput>
                  ))}
                </div>
              </MigrationOptionsForm>
              <MigrationOptionsForm
                title="... og er avhengig av komponenter som oppfyller følgende"
                addRowText="Legg til filter"
                dispatch={dispatchDependencyFilters}
                testId="dependency-filters"
              >
                <div className={styles.searchFilterInputs}>
                  {Object.keys(dependencyFilters).map((id) => (
                    <SearchFilterInput
                      key={id}
                      id={id}
                      searchFilter={dependencyFilters[id]}
                      dispatch={dispatchDependencyFilters}
                    />
                  ))}
                </div>
              </MigrationOptionsForm>
            </>
          )}
          <MigrationOptionsForm
            title={`Nye verdier for felter i ${migrationLevel === 'component' ? 'komponenten' : 'skjemaet'}`}
            addRowText="Legg til felt som skal endres"
            dispatch={dispatchEditInputs}
            testId="edit-options"
          >
            <div className={styles.formEditInputs}>
              {Object.keys(editInputs).map((id) => (
                <FormEditInput key={id} id={id} formEdit={editInputs[id]} dispatch={dispatchEditInputs}></FormEditInput>
              ))}
            </div>
          </MigrationOptionsForm>

          <div className={styles.hasMarginBottom}>
            <Button variant="primary" loading={isLoading}>
              Simuler og kontroller migrering
            </Button>

            <Button
              variant="tertiary"
              type="button"
              onClick={() => {
                setDryRunSearchResults({});
                dispatchFormSearchFilters({ type: 'clear' });
                dispatchSearchFilters({ type: 'clear' });
                dispatchDependencyFilters({ type: 'clear' });
                dispatchEditInputs({ type: 'clear' });
              }}
              className={styles.hasMarginLeft}
            >
              Nullstill skjema
            </Button>
          </div>
        </form>

        {migratedForms.length > 0 && <BulkPublishPanel forms={migratedForms} />}

        {dryRunSearchResults && (
          <>
            <Heading level="2" size="large">
              Resultater av simulert migrering
            </Heading>
            <p>
              Fant {dryRunSearchResults.length} skjemaer som matcher søkekriteriene.&nbsp;
              {numberOfComponentsFound !== undefined && (
                <span>
                  Totalt vil {numberOfComponentsChanged} av {numberOfComponentsFound}{' '}
                  {migrationLevel === 'component' ? 'komponenter' : 'skjemaer'} bli påvirket av endringene.
                </span>
              )}
            </p>
            {dryRunSearchResults.length > 0 && (
              <>
                <ConfirmMigration
                  selectedFormPaths={selectedToMigrate}
                  dryRunResults={dryRunSearchResults}
                  onConfirm={onConfirm}
                />
                {totalNumberOfPages > 1 && (
                  <div className={styles.pagination}>
                    <Pagination page={currentPage} onPageChange={setCurrentPage} count={totalNumberOfPages} />
                  </div>
                )}
                <MigrationDryRunResults
                  onChange={setSelectedToMigrate}
                  dryRunResults={resultsForCurrentPage}
                  selectedPaths={selectedToMigrate}
                  getPreviewUrl={(formPath) =>
                    `/migrering/forhandsvis/${formPath}${createUrlParams(
                      formSearchFilters,
                      searchFilters,
                      dependencyFilters,
                      editInputs,
                      migrationLevel,
                    )}`
                  }
                />
                {totalNumberOfPages > 1 && (
                  <div className={styles.pagination}>
                    <Pagination page={currentPage} onPageChange={setCurrentPage} count={totalNumberOfPages} />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      <Column className={styles.sideColumn}>
        <UserFeedback />
      </Column>
    </main>
  );
};

export default MigrationPage;

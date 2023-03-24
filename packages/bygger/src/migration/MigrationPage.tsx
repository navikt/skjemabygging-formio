import { makeStyles } from "@material-ui/styles";
import { Pagination } from "@navikt/ds-react";
import { NavFormType, paginationUtils } from "@navikt/skjemadigitalisering-shared-domain";
import Formiojs from "formiojs/Formio";
import { Knapp } from "nav-frontend-knapper";
import { Innholdstittel, Sidetittel } from "nav-frontend-typografi";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useHistory } from "react-router-dom";
import { DryRunResult } from "../../types/migration";
import Column from "../components/layout/Column";
import UserFeedback from "../components/UserFeedback";
import { runMigrationDryRun, runMigrationWithUpdate } from "./api";
import BulkPublishPanel from "./components/BulkPublishPanel";
import ConfirmMigration from "./components/ConfirmMigration";
import FormEditInput from "./components/FormEditInput";
import MigrationDryRunResults from "./components/MigrationDryRunResults";
import MigrationOptionsForm from "./components/MigrationOptionsForm";
import { reducer } from "./components/MigrationOptionsForm.reducer";
import SearchFilterInput from "./components/SearchFilterInput";
import {
  createEditOptions,
  createSearchFiltersFromParams,
  createUrlParams,
  getMigrationResultsMatchingSearchFilters,
  getUrlParamMap,
  migrationOptionsAsMap,
  searchFiltersAsParams,
} from "./utils";

const useStyles = makeStyles({
  root: {
    display: "flex",
    maxWidth: "80rem",
    margin: "0 auto 4rem auto",
  },
  mainContent: {
    flexDirection: "column",
    flex: "5",
  },
  sideColumn: {
    flexDirection: "column",
    flex: "1",
    marginLeft: "2rem",
  },
  mainHeading: {
    marginBottom: "4rem",
  },
  hasMarginBottom: {
    marginBottom: "2rem",
  },
  hasMarginLeft: {
    marginLeft: "1rem",
  },
  searchFilterInputs: {
    display: "grid",
    gridTemplateColumns: "3fr 1fr 3fr 0.2fr",
    gap: "0.25rem 1rem",
  },
  formEditInputs: {
    display: "grid",
    gridTemplateColumns: "3fr 3fr 0.2fr",
    gap: "0.25rem 1rem",
  },
  pagination: {
    display: "flex",
    marginTop: "2rem",
    justifyContent: "center",
  },
});

const MigrationPage = () => {
  const styles = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [{ dryRunSearchResults, numberOfComponentsFound, numberOfComponentsChanged }, setDryRunSearchResults] =
    useState<{
      dryRunSearchResults?: DryRunResult[];
      numberOfComponentsFound?: number;
      numberOfComponentsChanged?: number;
    }>({});
  const [selectedToMigrate, setSelectedToMigrate] = useState<string[]>([]);
  const [migratedForms, setMigratedForms] = useState<NavFormType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const MAX_ITEMS_PER_PAGE = 20;
  const totalNumberOfPages = Math.ceil((dryRunSearchResults || []).length / MAX_ITEMS_PER_PAGE);
  const resultsForCurrentPage = useMemo(
    () => paginationUtils.retrieveRangeOfList(dryRunSearchResults || [], currentPage, MAX_ITEMS_PER_PAGE),
    [dryRunSearchResults, currentPage]
  );

  const history = useHistory();
  const params = new URLSearchParams(history.location.search);

  const [searchFilters, dispatchSearchFilters] = useReducer(reducer, {}, () =>
    createSearchFiltersFromParams(getUrlParamMap(params, "searchFilters"))
  );
  const [dependencyFilters, dispatchDependencyFilters] = useReducer(reducer, {}, () =>
    createSearchFiltersFromParams(getUrlParamMap(params, "dependencyFilters"))
  );
  const [editInputs, dispatchEditInputs] = useReducer(reducer, {}, () =>
    createEditOptions(getUrlParamMap(params, "editOptions"))
  );

  const onSearch = async () => {
    setIsLoading(true);
    const results = await runMigrationDryRun(searchFilters, dependencyFilters, editInputs);
    const dryRunSearchResults = getMigrationResultsMatchingSearchFilters(results);
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
        }
      ),
    });
    setSelectedToMigrate(
      dryRunSearchResults
        .filter(({ changed }) => changed > 0)
        .map(({ path }) => path)
        .filter((path) => {
          const dryRunResultForForm = dryRunSearchResults.find((form) => form.path === path);
          const numberOfBreakingChanges = dryRunResultForForm?.breakingChanges?.length || 0;
          return numberOfBreakingChanges === 0;
        })
    );

    setIsLoading(false);
    history.push({ search: createUrlParams(searchFilters, dependencyFilters, editInputs) });
  };

  const onConfirm = async () => {
    const updatedForms = await runMigrationWithUpdate(Formiojs.getToken(), {
      searchFilters: searchFiltersAsParams(searchFilters),
      dependencyFilters: searchFiltersAsParams(dependencyFilters),
      editOptions: migrationOptionsAsMap(editInputs),
      include: selectedToMigrate,
    });
    setMigratedForms(updatedForms);
    setDryRunSearchResults({});
  };

  useEffect(() => {
    (async () => {
      if (params.get("searchFilters") || params.get("editOptions")) {
        await onSearch();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className={styles.root}>
      <Column className={styles.mainContent}>
        <Sidetittel className={styles.mainHeading}>Søk og migrer</Sidetittel>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await onSearch();
          }}
        >
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
          <MigrationOptionsForm
            title="Nye verdier for felter i komponenten"
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
            <Knapp type="hoved" spinner={isLoading}>
              Simuler og kontroller migrering
            </Knapp>

            <Knapp
              type="flat"
              onClick={() => {
                history.push();
                history.go();
              }}
              className={styles.hasMarginLeft}
            >
              Nullstill skjema
            </Knapp>
          </div>
        </form>

        {migratedForms.length > 0 && <BulkPublishPanel forms={migratedForms} />}

        {dryRunSearchResults && (
          <>
            <Innholdstittel tag="h2">Resultater av simulert migrering</Innholdstittel>
            <p>
              Fant {dryRunSearchResults.length} skjemaer som matcher søkekriteriene.&nbsp;
              {numberOfComponentsFound !== undefined && (
                <span>
                  Totalt vil {numberOfComponentsChanged} av {numberOfComponentsFound} komponenter bli påvirket av
                  endringene.
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
                    `/migrering/forhandsvis/${formPath}${createUrlParams(searchFilters, dependencyFilters, editInputs)}`
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
      </Column>
      <Column className={styles.sideColumn}>
        <UserFeedback />
      </Column>
    </main>
  );
};

export default MigrationPage;

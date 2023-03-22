import { makeStyles } from "@material-ui/styles";
import { Button, Heading, Pagination } from "@navikt/ds-react";
import { NavFormType, paginationUtils } from "@navikt/skjemadigitalisering-shared-domain";
import Formiojs from "formiojs/Formio";
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
  hasMarginBottom: {
    marginBottom: "2rem",
  },
  hasMarginLeft: {
    marginLeft: "1rem",
  },
  searchFilterInputs: {
    display: "grid",
    gridTemplateColumns: "3fr 1fr 3fr",
    gap: "0.25rem 1rem",
  },
  formEditInputs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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
  const [editInputs, dispatchEditInputs] = useReducer(reducer, {}, () =>
    createEditOptions(getUrlParamMap(params, "editOptions"))
  );

  const onSearch = async () => {
    setIsLoading(true);
    const results = await runMigrationDryRun(searchFilters, editInputs);
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
    history.push(createUrlParams(searchFilters, editInputs));
  };

  const onConfirm = async () => {
    const updatedForms = await runMigrationWithUpdate(Formiojs.getToken(), {
      searchFilters: searchFiltersAsParams(searchFilters),
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
        <Heading level="1" size="xlarge">
          Søk og migrer
        </Heading>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await onSearch();
          }}
        >
          <MigrationOptionsForm title="Filtrer" addRowText="Legg til filtreringsvalg" dispatch={dispatchSearchFilters}>
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
            title="Sett opp felter som skal migreres og ny verdi for feltene"
            addRowText="Legg til felt som skal endres"
            dispatch={dispatchEditInputs}
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
                history.push();
                history.go();
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
                    `/migrering/forhandsvis/${formPath}${createUrlParams(searchFilters, editInputs)}`
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

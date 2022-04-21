import { makeStyles } from "@material-ui/styles";
import Formiojs from "formiojs/Formio";
import { Knapp } from "nav-frontend-knapper";
import { Innholdstittel, Sidetittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { DryRunResult } from "../../types/migration";
import Column from "../components/layout/Column";
import UserFeedback from "../components/UserFeedback";
import { NavFormType } from "../Forms/navForm";
import { runMigrationDryRun, runMigrationWithUpdate } from "./api";
import BulkPublishPanel from "./components/BulkPublishPanel";
import ConfirmMigration from "./components/ConfirmMigration";
import MigrationDryRunResults from "./components/MigrationDryRunResults";
import MigrationOptionsForm, { useMigrationOptions } from "./components/MigrationOptionsForm";
import {
  createUrlParams,
  getMigrationResultsMatchingSearchFilters,
  getUrlParamMap,
  migrationOptionsAsMap,
} from "./utils";

const useStyles = makeStyles({
  root: {
    display: "flex",
    maxWidth: "70rem",
    margin: "0 auto 4rem auto",
  },
  mainContent: {
    flexDirection: "column",
    flex: "3",
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

  const history = useHistory();
  const params = new URLSearchParams(history.location.search);

  const [searchFilters, dispatchSearchFilters] = useMigrationOptions(getUrlParamMap(params, "searchFilters"));
  const [editOptions, dispatchEditOptions] = useMigrationOptions(getUrlParamMap(params, "editOptions"));

  const onSearch = async () => {
    setIsLoading(true);
    const results = await runMigrationDryRun(searchFilters, editOptions);
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
    history.push(createUrlParams(searchFilters, editOptions));
  };

  const onConfirm = async () => {
    const updatedForms = await runMigrationWithUpdate(Formiojs.getToken(), {
      searchFilters: migrationOptionsAsMap(searchFilters),
      editOptions: migrationOptionsAsMap(editOptions),
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
            title="Filtrer"
            addRowText="Legg til filtreringsvalg"
            state={searchFilters}
            dispatch={dispatchSearchFilters}
          />
          <MigrationOptionsForm
            title="Sett opp felter som skal migreres og ny verdi for feltene"
            addRowText="Legg til felt som skal endres"
            state={editOptions}
            dispatch={dispatchEditOptions}
          />

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
                <MigrationDryRunResults
                  onChange={setSelectedToMigrate}
                  dryRunResults={dryRunSearchResults}
                  selectedPaths={selectedToMigrate}
                  getPreviewUrl={(formPath) =>
                    `/migrering/forhandsvis/${formPath}${createUrlParams(searchFilters, editOptions)}`
                  }
                />
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

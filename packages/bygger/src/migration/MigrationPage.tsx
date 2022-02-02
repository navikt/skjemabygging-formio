import { makeStyles } from "@material-ui/styles";
import Formiojs from "formiojs/Formio";
import { Knapp } from "nav-frontend-knapper";
import { Sidetittel } from "nav-frontend-typografi";
import React, { useState } from "react";
import { DryRunResult, DryRunResults, MigrationOptions } from "../../types/migration";
import MigrationDryRunResults from "./MigrationDryRunResults";
import MigrationOptionsForm, { useMigrationOptions } from "./MigrationOptionsForm";

const useStyles = makeStyles({
  root: {
    maxWidth: "60rem",
    margin: "0 auto",
  },
  mainHeading: {
    marginBottom: "4rem",
  },
});

const migrationOptionsAsMap = (migrationOptions: MigrationOptions) => {
  if (Object.keys(migrationOptions).length === 0) {
    return "";
  }
  return Object.values(migrationOptions).reduce((acc, curr) => {
    if (curr.key !== "" && curr.value !== "") {
      return {
        ...acc,
        [curr.key]: curr.value,
      };
    }
    return acc;
  }, {});
};

export const getUrlWithMigrateSearchParams = (
  searchFilters: MigrationOptions,
  editOptions: MigrationOptions,
  basePath: string = "/api/migrate"
) => {
  let searchFilterParameters = "";
  let editOptionsParameters = "";
  const encodedSearchFilters = JSON.stringify(migrationOptionsAsMap(searchFilters));
  if (encodedSearchFilters) {
    searchFilterParameters = `?searchFilters=${encodedSearchFilters}`;
    const encodedEditOption = JSON.stringify(migrationOptionsAsMap(editOptions));
    if (encodedEditOption) {
      editOptionsParameters = `&editOptions=${encodedEditOption}`;
    }
  }
  return `${basePath}${searchFilterParameters}${editOptionsParameters}`;
};

const getMigrationResultsMatchingSearchFilters = (dryRunResults: DryRunResults) =>
  Object.values(dryRunResults)
    .filter((results) => results.found > 0)
    .sort((a, b) => b.found - a.found);

const MigrationPage = () => {
  const styles = useStyles();
  const [{ dryRunSearchResults, numberOfComponentsFound, numberOfComponentsChanged }, setFormMigrationResults] =
    useState<{
      dryRunSearchResults?: DryRunResult[];
      numberOfComponentsFound?: number;
      numberOfComponentsChanged?: number;
    }>({});
  const [selectedToMigrate, setSelectedToMigrate] = useState<string[]>([]);

  const [searchFilters, dispatchSearchFilters] = useMigrationOptions();
  const [editOptions, dispatchEditOptions] = useMigrationOptions();

  const onSearch = async () => {
    const results = await fetch(getUrlWithMigrateSearchParams(searchFilters, editOptions), {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    }).then((response) => response.json());
    const dryRunSearchResults = getMigrationResultsMatchingSearchFilters(results);
    setFormMigrationResults({
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
    setSelectedToMigrate(dryRunSearchResults.filter(({ changed }) => changed > 0).map(({ path }) => path));
  };
  return (
    <main className={styles.root}>
      <Sidetittel className={styles.mainHeading}>Søk og migrer</Sidetittel>
      <MigrationOptionsForm
        onSubmit={onSearch}
        title="Søk og filtrer"
        addRowText="Legg til filteringsvalg"
        submitText="Søk"
        state={searchFilters}
        dispatch={dispatchSearchFilters}
      />
      <MigrationOptionsForm
        title="Sett opp felter som skal migreres og ny verdi for feltene"
        addRowText="Legg til felt som skal migreres"
        submitText="Simuler og kontroller migrering"
        state={editOptions}
        dispatch={dispatchEditOptions}
        onSubmit={onSearch}
      />

      {dryRunSearchResults && (
        <>
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
              <Knapp
                onClick={() => {
                  fetch(getUrlWithMigrateSearchParams(searchFilters, editOptions, "/api/migrate/update"), {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                    },
                    body: JSON.stringify({
                      token: Formiojs.getToken(),
                      payload: {
                        searchFilters: migrationOptionsAsMap(searchFilters),
                        editOptions: migrationOptionsAsMap(editOptions),
                        include: selectedToMigrate,
                      },
                    }),
                  }).then((resp) => resp.json().then(console.log));
                }}
                htmlType="button"
              >
                Migrer
              </Knapp>
              <MigrationDryRunResults
                onChange={setSelectedToMigrate}
                dryRunResults={dryRunSearchResults}
                selectedPaths={selectedToMigrate}
                getPreviewUrl={(formPath) =>
                  getUrlWithMigrateSearchParams(searchFilters, editOptions, `/migrering/forhandsvis/${formPath}`)
                }
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default MigrationPage;

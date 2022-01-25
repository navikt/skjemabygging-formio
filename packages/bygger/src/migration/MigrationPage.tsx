import { makeStyles } from "@material-ui/styles";
import { Sidetittel, Undertittel } from "nav-frontend-typografi";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FormMigrationResult, FormMigrationResults, MigrationOptions } from "../../types/migration";
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

const encodeForUrl = (migrationOptions: MigrationOptions) => {
  if (Object.keys(migrationOptions).length === 0) {
    return "";
  }
  const keyValuePairs = Object.values(migrationOptions).reduce((acc, curr) => {
    if (curr.key !== "" && curr.value !== "") {
      return {
        ...acc,
        [curr.key]: curr.value,
      };
    }
    return acc;
  }, {});
  return JSON.stringify(keyValuePairs);
};

const getUrlWithMigrateSearchParams = (
  searchFilters: MigrationOptions,
  editOptions: MigrationOptions,
  basePath: string = "/api/migrate"
) => {
  let searchFilterParameters = "";
  let editOptionsParameters = "";
  const encodedSearchFilters = encodeForUrl(searchFilters);
  if (encodedSearchFilters) {
    searchFilterParameters = `?searchFilters=${encodedSearchFilters}`;
    const encodedEditOption = encodeForUrl(editOptions);
    if (encodedEditOption) {
      editOptionsParameters = `&editOptions=${encodedEditOption}`;
    }
  }
  return `${basePath}${searchFilterParameters}${editOptionsParameters}`;
};

const getMigrationResultsMatchingSearchFilters = (mapOfForms: FormMigrationResults) =>
  Object.values(mapOfForms)
    .filter((migrationResult) => migrationResult.found > 0)
    .sort((a, b) => b.found - a.found);

const getFormsThatWillBeChanged = (mapOfForms: FormMigrationResults) =>
  Object.values(mapOfForms)
    .filter((migrationResult) => migrationResult.changed > 0)
    .sort((a, b) => b.changed - a.changed);

const MigrationPage = () => {
  const styles = useStyles();
  const [
    // eslint-disable-next-line no-unused-vars
    { searchResults, migrationResults, numberOfComponentsFound, numberOfComponentsChanged },
    setFormMigrationResults,
  ] = useState<{
    searchResults?: FormMigrationResult[];
    migrationResults?: FormMigrationResult[];
    numberOfComponentsFound?: number;
    numberOfComponentsChanged?: number;
  }>({});

  const [searchFilters, dispatchSearchFilters] = useMigrationOptions();
  const [editOptions, dispatchEditOptions] = useMigrationOptions();

  const onSearch = async () => {
    const results = await fetch(getUrlWithMigrateSearchParams(searchFilters, editOptions), {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    }).then((response) => response.json());
    const formsWithComponentsThatMatchSearchFilters = getMigrationResultsMatchingSearchFilters(results);
    const formsWithComponentsThatWillBeChanged = getFormsThatWillBeChanged(results);
    setFormMigrationResults({
      searchResults: formsWithComponentsThatMatchSearchFilters,
      migrationResults: formsWithComponentsThatWillBeChanged,
      ...formsWithComponentsThatMatchSearchFilters.reduce(
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

      {searchResults && (
        <>
          <p>
            Fant {searchResults.length} skjemaer som matcher søkekriteriene.&nbsp;
            {numberOfComponentsFound !== undefined && (
              <span>
                Totalt vil {numberOfComponentsChanged} av {numberOfComponentsFound} komponenter bli påvirket av
                endringene.
              </span>
            )}
          </p>
          {searchResults.length > 0 && (
            <ul>
              {searchResults.map((searchResult) => (
                <li key={searchResult.skjemanummer}>
                  <Undertittel>
                    {searchResult.title} ({searchResult.skjemanummer})
                  </Undertittel>
                  <p>
                    Antall komponenter som matcher søket: {searchResult.changed} av {searchResult.found}
                  </p>
                  {searchResult.diff.length > 0 && <pre>{JSON.stringify(searchResult.diff, null, 2)}</pre>}
                  <Link
                    className="knapp"
                    to={getUrlWithMigrateSearchParams(
                      searchFilters,
                      editOptions,
                      `/migrering/forhandsvis/${searchResult.path}`
                    )}
                  >
                    Forhåndsvis
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
};

export default MigrationPage;

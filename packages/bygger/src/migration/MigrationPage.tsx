import { makeStyles } from "@material-ui/styles";
import Formiojs from "formiojs/Formio";
import Panel from "nav-frontend-paneler";
import { Innholdstittel, Sidetittel, Undertekst, Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { DryRunResult, DryRunResults, MigrationOptions } from "../../types/migration";
import ConfirmMigration from "./ConfirmMigration";
import MigrationDryRunResults from "./MigrationDryRunResults";
import MigrationOptionsForm, { useMigrationOptions } from "./MigrationOptionsForm";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    maxWidth: "60rem",
    margin: "0 auto",
  },
  mainHeading: {
    marginBottom: "4rem",
  },
});

export const migrationOptionsAsMap = (migrationOptions: MigrationOptions) => {
  if (Object.keys(migrationOptions).length === 0) {
    return "";
  }
  return Object.values(migrationOptions).reduce((acc, curr) => {
    if (curr.key !== "") {
      return {
        ...acc,
        [curr.key]: curr.value,
      };
    }
    return acc;
  }, {});
};

export const createUrlParams = (
  searchFilters: MigrationOptions,
  editOptions: MigrationOptions,
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
  return `${searchFilterParameters}${editOptionsParameters}`;
};

export const getUrlWithMigrateSearchParams = (
  searchFilters: MigrationOptions,
  editOptions: MigrationOptions,
  basePath: string = "/api/migrate"
) => {
  return `${basePath}${createUrlParams(searchFilters, editOptions)}`;
};

const getMigrationResultsMatchingSearchFilters = (dryRunResults: DryRunResults) =>
  Object.values(dryRunResults)
    .filter((results) => results.found > 0)
    .sort((a, b) => b.found - a.found);

const getUrlParamMap = (params, name) => {
  const param = params.get(name);
  if (param) {
    return JSON.parse(param);
  } else {
    return {};
  }
}

const MigrationPage = () => {
  const styles = useStyles();
  const [{ dryRunSearchResults, numberOfComponentsFound, numberOfComponentsChanged }, setDryRunSearchResults] =
    useState<{
      dryRunSearchResults?: DryRunResult[];
      numberOfComponentsFound?: number;
      numberOfComponentsChanged?: number;
    }>({});
  const [selectedToMigrate, setSelectedToMigrate] = useState<string[]>([]);
  const [migratedForms, setMigratedForms] = useState<any[]>([]);

  const history = useHistory();
  const params = new URLSearchParams(history.location.search);

  const [searchFilters, dispatchSearchFilters] = useMigrationOptions(getUrlParamMap(params, 'searchFilters'));
  const [editOptions, dispatchEditOptions] = useMigrationOptions(getUrlParamMap(params, 'editOptions'));

  const onSearch = async () => {
    const results = await fetch(getUrlWithMigrateSearchParams(searchFilters, editOptions), {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .catch((err) => console.error(err));
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
    setSelectedToMigrate(dryRunSearchResults.filter(({ changed }) => changed > 0).map(({ path }) => path));

    history.push(createUrlParams(searchFilters, editOptions));
  };

  const onConfirm = async () => {
    try {
      const updatedFormsResponse = await fetch("/api/migrate/update", {
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
      });
      const updatedForms = await updatedFormsResponse.json();
      setMigratedForms(updatedForms);
      setDryRunSearchResults({});
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      await onSearch();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className={styles.root}>
      <Sidetittel className={styles.mainHeading}>Søk og migrer</Sidetittel>
      <MigrationOptionsForm
        onSubmit={onSearch}
        title="Søk og filtrer"
        addRowText="Legg til filtreringsvalg"
        submitText="Søk"
        state={searchFilters}
        dispatch={dispatchSearchFilters}
      />
      <MigrationOptionsForm
        title="Sett opp felter som skal migreres og ny verdi for feltene"
        addRowText="Legg til felt som skal endres"
        submitText="Simuler og kontroller migrering"
        state={editOptions}
        dispatch={dispatchEditOptions}
        onSubmit={onSearch}
      />

      {migratedForms.length > 0 && (
        <Panel className="margin-bottom-double">
          <Undertittel tag="h3">Disse skjemaene ble migrert, og må publiseres manuelt</Undertittel>
          <Undertekst>
            Pass på å kopiere denne listen før du laster siden på nytt eller utfører en ny migrering
          </Undertekst>
          <ul>
            {migratedForms.map((form) => (
              <li>{`${form.properties.skjemanummer} - ${form.name} (${form.path})`}</li>
            ))}
          </ul>
        </Panel>
      )}

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

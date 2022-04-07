import { makeStyles } from "@material-ui/styles";
import Formiojs from "formiojs/Formio";
import { Knapp } from "nav-frontend-knapper";
import Panel from "nav-frontend-paneler";
import { Innholdstittel, Sidetittel, Undertekst, Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { DryRunResult, DryRunResults, MigrationOptions } from "../../types/migration";
import { bulkPublish, runMigrationDryRun, runMigrationWithUpdate } from "./api";
import ConfirmMigration from "./ConfirmMigration";
import MigrationDryRunResults from "./MigrationDryRunResults";
import MigrationOptionsForm, { useMigrationOptions } from "./MigrationOptionsForm";
import { createUrlParams } from "./utils";

const useStyles = makeStyles({
  root: {
    maxWidth: "60rem",
    margin: "0 auto",
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

const getMigrationResultsMatchingSearchFilters = (dryRunResults: DryRunResults) =>
  dryRunResults
    ? Object.values(dryRunResults)
        .filter((results) => results.found > 0)
        .sort((a, b) => b.found - a.found)
    : [];

const getUrlParamMap = (params, name) => {
  const param = params.get(name);
  if (param) {
    return JSON.parse(param);
  } else {
    return {};
  }
};

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
  const [migratedForms, setMigratedForms] = useState<any[]>([]);

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

  const onBulkPublish = async (formPaths) => {
    const bulkPublishResult = await bulkPublish(Formiojs.getToken(), { formPaths });
    console.log("bulkPublishResult", bulkPublishResult);
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

      {migratedForms.length > 0 && (
        <Panel className="margin-bottom-double">
          <Undertittel tag="h3">Disse skjemaene ble migrert, og må publiseres manuelt</Undertittel>
          <Undertekst>
            Pass på å kopiere denne listen før du laster siden på nytt eller utfører en ny migrering
          </Undertekst>
          <Knapp onClick={() => onBulkPublish(migratedForms.map((form) => form.path))}>Publiser nå</Knapp>
          <ul>
            {migratedForms.map((form) => (
              <li
                key={form.properties.skjemanummer}
              >{`${form.properties.skjemanummer} - ${form.name} (${form.path})`}</li>
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
                  `/migrering/forhandsvis/${formPath}${createUrlParams(searchFilters, editOptions)}`
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

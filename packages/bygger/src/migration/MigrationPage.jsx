import { makeStyles } from "@material-ui/styles";
import { Sidetittel, Undertittel } from "nav-frontend-typografi";
import React, { useState } from "react";
import { Link } from "react-router-dom";
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

const encodeForUrl = (mapIndexedByUniqueIds) => {
  if (Object.keys(mapIndexedByUniqueIds).length === 0) {
    return "";
  }
  const keyValuePairs = Object.values(mapIndexedByUniqueIds).reduce((acc, curr) => {
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

const getSearchUrl = (searchFilters, editOptions) => {
  let url = "/api/migrate";
  const encodedSearchFilters = encodeForUrl(searchFilters);
  if (encodedSearchFilters) {
    url += `?searchFilters=${encodedSearchFilters}`;
    const encodedEditOption = encodeForUrl(editOptions);
    if (encodedEditOption) {
      url += `&editOptions=${encodedEditOption}`;
    }
  }
  return url;
};

const getFormsThatMatchesSearchFilters = (mapOfForms) =>
  Object.entries(mapOfForms)
    .map(([key, value]) => ({
      ...value,
      skjemanummer: key,
    }))
    .filter((form) => form.found > 0)
    .sort((a, b) => b.found - a.found);

const getFormsThatWillBeChanged = (mapOfForms) =>
  Object.entries(mapOfForms)
    .map(([key, value]) => ({
      ...value,
      skjemanummer: key,
    }))
    .filter((form) => form.changed > 0)
    .sort((a, b) => b.changed - a.changed);

const MigrationPage = () => {
  const styles = useStyles();
  const [
    { formMigrationResults, numberOfComponentsFound, numberOfComponentsChanged },
    setFormMigrationResults,
  ] = useState({});

  const [searchFilters, dispatchSearchFilters] = useMigrationOptions();
  const [editOptions, dispatchEditOptions] = useMigrationOptions();

  const onSearch = async () => {
    const results = await fetch(getSearchUrl(searchFilters, editOptions), {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    }).then((results) => results.json());
    const formsWithComponentsThatMatchSearchFilters = getFormsThatMatchesSearchFilters(results);
    const formsWithComponentsThatWillBeChanged = getFormsThatWillBeChanged(results);
    setFormMigrationResults({
      formMigrationResults: formsWithComponentsThatMatchSearchFilters,
      changedForms: formsWithComponentsThatWillBeChanged,
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

      {formMigrationResults && (
        <>
          <p>
            Fant {formMigrationResults.length} skjemaer som matcher søkekriteriene.&nbsp;
            {numberOfComponentsFound !== undefined && (
              <span>
                Totalt vil {numberOfComponentsChanged} av {numberOfComponentsFound} komponenter bli påvirket av
                endringene.
              </span>
            )}
          </p>
          {formMigrationResults.length > 0 && (
            <ul>
              {formMigrationResults.map((form) => (
                <li key={form.skjemanummer}>
                  <Undertittel>
                    {form.title} ({form.skjemanummer})
                  </Undertittel>
                  <p>
                    Antall komponenter som matcher søket: {form.changed} av {form.found}
                  </p>
                  {form.diff.length > 0 && <pre>{JSON.stringify(form.diff, null, 2)}</pre>}
                  <Link className="knapp" to={`/migrering/forhandsvis/${form.path}`}>
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

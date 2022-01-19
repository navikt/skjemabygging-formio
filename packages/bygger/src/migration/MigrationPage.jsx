import { makeStyles } from "@material-ui/styles";
import { Sidetittel, Undertittel } from "nav-frontend-typografi";
import React, { useState } from "react";
import { AppLayoutWithContext } from "../components/AppLayout";
import KeyValuePairsForm, { useKeyValuePairs } from "./KeyValuePairsForm";

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

const MigrationPage = () => {
  const styles = useStyles();
  const [foundForms, setFoundForms] = useState(undefined);
  const [numberOfComponentsFound, setNumberOfComponentsFound] = useState(undefined);

  const [searchFilters, dispatchSearchFilters] = useKeyValuePairs();
  const [editOptions, dispatchEditOptions] = useKeyValuePairs();

  const onSearch = async () => {
    const results = await fetch(getSearchUrl(searchFilters, editOptions), {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    }).then((results) => results.json());
    const formsWithComponentsThatMatchSearchFilters = Object.entries(results)
      .map(([key, value]) => ({
        ...value,
        skjemanummer: key,
      }))
      .filter(({ found }) => found !== 0);
    setFoundForms(formsWithComponentsThatMatchSearchFilters);
    setNumberOfComponentsFound(formsWithComponentsThatMatchSearchFilters.reduce((acc, curr) => acc + curr.found, 0));
  };
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Rediger skjema",
        visSkjemaliste: true,
      }}
    >
      <main className={styles.root}>
        <Sidetittel className={styles.mainHeading}>Søk og migrer</Sidetittel>
        <KeyValuePairsForm
          onSubmit={onSearch}
          title="Søk og filtrer"
          addRowText="Legg til filteringsvalg"
          submitText="Søk"
          state={searchFilters}
          dispatch={dispatchSearchFilters}
        />
        <KeyValuePairsForm
          title="Sett opp felter som skal migreres og ny verdi for feltene"
          addRowText="Legg til felt som skal migreres"
          submitText="Simuler og kontroller migrering"
          state={editOptions}
          dispatch={dispatchEditOptions}
          onSubmit={onSearch}
        />

        {foundForms && (
          <>
            <p>
              Fant {foundForms.length} skjemaer som matcher søkekriteriene.&nbsp;
              {numberOfComponentsFound !== undefined && (
                <span>Totalt {numberOfComponentsFound} komponenter vil bli påvirket av endringene.</span>
              )}
            </p>
            {foundForms.length > 0 && (
              <ul>
                {foundForms.map((form) => (
                  <li key={form.skjemanummer}>
                    <Undertittel>
                      {form.title} ({form.skjemanummer})
                    </Undertittel>
                    <p>Antall komponenter som matcher søket: {form.found}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </AppLayoutWithContext>
  );
};

export default MigrationPage;

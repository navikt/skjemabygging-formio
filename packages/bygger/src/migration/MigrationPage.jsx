import { Undertittel } from "nav-frontend-typografi";
import React, { useState } from "react";
import { AppLayoutWithContext } from "../components/AppLayout";
import EditOptionsForm from "./EditOptionsForm";
import KeyValuePairsForm from "./KeyValuePairsForm";

const MigrationPage = () => {
  const [foundForms, setFoundForms] = useState(undefined);
  const [numberOfComponentsFound, setNumberOfComponentsFound] = useState(undefined);
  const onSearch = async (searchFilters) => {
    const mappedSearchFilters = Object.values(searchFilters).reduce(
      (acc, curr) => ({
        ...acc,
        [curr.key]: curr.value,
      }),
      {}
    );
    const results = await fetch(`/api/migrate?searchFilters=${JSON.stringify(mappedSearchFilters)}`, {
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
      <h1>Søk og migrer</h1>
      <KeyValuePairsForm
        onSubmit={onSearch}
        title="Søk og filtrer"
        addRowText="Legg til filteringsvalg"
        submitText="Søk"
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
      <EditOptionsForm />
    </AppLayoutWithContext>
  );
};

export default MigrationPage;

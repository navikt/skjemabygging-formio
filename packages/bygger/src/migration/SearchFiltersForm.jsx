import { Knapp } from "nav-frontend-knapper";
import { Input } from "nav-frontend-skjema";
import { Innholdstittel } from "nav-frontend-typografi";
import React, { useState } from "react";

const SearchFiltersForm = ({ onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState([{ key: "", value: "" }]);
  return (
    <>
      <Innholdstittel>Søk og filtrer</Innholdstittel>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setIsLoading(true);
          onSubmit(searchFilters).then((result) => {
            setIsLoading(false);
            return result;
          });
        }}
      >
        {searchFilters.map(({ key, value }, index) => (
          <div key={index}>
            <Input
              label="Felt id"
              type="text"
              onChange={(event) =>
                setSearchFilters([
                  ...searchFilters.filter((editOptionsRow) => editOptionsRow.key !== key),
                  {
                    key: event.target.value,
                    value,
                  },
                ])
              }
            />
            <Input
              label="Ny verdi"
              type="text"
              disabled={!key}
              onChange={(event) =>
                setSearchFilters([
                  ...searchFilters.filter((editOptionsRow) => editOptionsRow.key !== key),
                  {
                    key,
                    value: event.target.value,
                  },
                ])
              }
            />
          </div>
        ))}
        <Knapp
          onClick={() => {
            setSearchFilters([
              ...searchFilters,
              {
                key: "",
                value: "",
              },
            ]);
          }}
          htmlType="button"
        >
          Legg til filteringsvalg
        </Knapp>
        <Knapp type="hoved" spinner={isLoading}>
          Søk
        </Knapp>
      </form>
    </>
  );
};

export default SearchFiltersForm;

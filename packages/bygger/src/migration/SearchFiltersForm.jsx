import { Knapp } from "nav-frontend-knapper";
import { Input } from "nav-frontend-skjema";
import { Innholdstittel } from "nav-frontend-typografi";
import React, { useState } from "react";

const SearchFiltersForm = ({ onSubmit }) => {
  const [searchFilters, setSearchFilters] = useState([{ key: "", value: "" }]);
  return (
    <>
      <Innholdstittel>Søk og filtrer</Innholdstittel>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(searchFilters);
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
          onClick={() =>
            setSearchFilters([
              ...searchFilters,
              {
                key: "",
                value: "",
              },
            ])
          }
          htmlType="button"
        >
          Legg til filteringsvalg
        </Knapp>
        <Knapp>Søk</Knapp>
      </form>
    </>
  );
};

export default SearchFiltersForm;

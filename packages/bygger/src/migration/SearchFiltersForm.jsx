import { guid } from "nav-frontend-js-utils";
import { Knapp } from "nav-frontend-knapper";
import { Input } from "nav-frontend-skjema";
import { Innholdstittel } from "nav-frontend-typografi";
import React, { useState } from "react";

const SearchFiltersForm = ({ onSubmit, title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    [guid()]: { key: "", value: "" },
  });
  return (
    <>
      <Innholdstittel>{title}</Innholdstittel>
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
        {Object.keys(searchFilters).map((id) => {
          const { key, value } = searchFilters[id];
          return (
            <div key={id}>
              <Input
                label="Felt id"
                type="text"
                onChange={(event) =>
                  setSearchFilters({
                    ...searchFilters,
                    [id]: {
                      key: event.target.value,
                      value,
                    },
                  })
                }
              />
              <Input
                label="Ny verdi"
                type="text"
                disabled={!key}
                onChange={(event) =>
                  setSearchFilters({
                    ...searchFilters,
                    [id]: {
                      key,
                      value: event.target.value,
                    },
                  })
                }
              />
            </div>
          );
        })}
        <Knapp
          onClick={() => {
            setSearchFilters({
              ...searchFilters,
              [guid()]: {
                key: "",
                value: "",
              },
            });
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

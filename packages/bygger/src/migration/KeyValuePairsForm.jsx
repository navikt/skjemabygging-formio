import { guid } from "nav-frontend-js-utils";
import { Knapp } from "nav-frontend-knapper";
import { Input } from "nav-frontend-skjema";
import { Innholdstittel } from "nav-frontend-typografi";
import React, { useState } from "react";

const KeyValuePairsForm = ({ addRowText, onSubmit, submitText, title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [keyValuePairs, setKeyValuePairs] = useState({
    [guid()]: { key: "", value: "" },
  });
  return (
    <>
      <Innholdstittel>{title}</Innholdstittel>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setIsLoading(true);
          onSubmit(keyValuePairs).then((result) => {
            setIsLoading(false);
            return result;
          });
        }}
      >
        {Object.keys(keyValuePairs).map((id) => {
          const { key, value } = keyValuePairs[id];
          return (
            <div key={id}>
              <Input
                label="Felt id"
                type="text"
                onChange={(event) =>
                  setKeyValuePairs({
                    ...keyValuePairs,
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
                  setKeyValuePairs({
                    ...keyValuePairs,
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
            setKeyValuePairs({
              ...keyValuePairs,
              [guid()]: {
                key: "",
                value: "",
              },
            });
          }}
          htmlType="button"
        >
          {addRowText}
        </Knapp>
        <Knapp type="hoved" spinner={isLoading}>
          {submitText}
        </Knapp>
      </form>
    </>
  );
};

export default KeyValuePairsForm;

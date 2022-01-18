import { makeStyles } from "@material-ui/styles";
import { guid } from "nav-frontend-js-utils";
import { Knapp } from "nav-frontend-knapper";
import { Input } from "nav-frontend-skjema";
import { Innholdstittel } from "nav-frontend-typografi";
import React, { useState } from "react";

const getStyles = makeStyles({
  hasMarginBottom: {
    marginBottom: "1rem",
  },
});

const KeyValuePairsForm = ({ addRowText, onSubmit, submitText, title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [keyValuePairs, setKeyValuePairs] = useState({
    [guid()]: { key: "", value: "" },
  });
  const styles = getStyles();
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
                className={styles.hasMarginBottom}
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
                className={styles.hasMarginBottom}
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
        <div>
          <Knapp
            className={styles.hasMarginBottom}
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
        </div>
        <div>
          <Knapp className={styles.hasMarginBottom} type="hoved" spinner={isLoading}>
            {submitText}
          </Knapp>
        </div>
      </form>
    </>
  );
};

export default KeyValuePairsForm;

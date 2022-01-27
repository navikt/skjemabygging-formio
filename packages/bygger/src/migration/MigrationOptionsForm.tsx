import { makeStyles } from "@material-ui/styles";
import { guid } from "nav-frontend-js-utils";
import { Knapp } from "nav-frontend-knapper";
import { Input } from "nav-frontend-skjema";
import { Innholdstittel } from "nav-frontend-typografi";
import React, { Dispatch, Fragment, useReducer, useState } from "react";
import { MigrationOption, MigrationOptions } from "../../types/migration";

const getStyles = makeStyles({
  form: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.25rem 1rem",
  },
  hasMarginBottom: {
    marginBottom: "1rem",
  },
});

const createMigrationOption = (): { [key: string]: MigrationOption } => ({
  [guid()]: {
    key: "",
    value: "",
  },
});

type Action =
  | { type: "add" }
  | {
      type: "edit";
      payload: { id: string } & Partial<MigrationOption>;
    };

const reducer = (state: MigrationOptions = {}, action: Action) => {
  switch (action.type) {
    case "add":
      return {
        ...state,
        ...createMigrationOption(),
      };
    case "edit":
      const { id, ...rest } = action.payload;
      return {
        ...state,
        [id]: {
          ...state[id],
          ...rest,
        },
      };
    default:
      return state;
  }
};

const isJSON = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch (_e) {
    return false;
  }
};

export const useMigrationOptions = () => useReducer(reducer, createMigrationOption(), () => createMigrationOption());

interface MigrationOptionsFormProps {
  title: string;
  submitText: string;
  addRowText: string;
  onSubmit: () => Promise<void>;
  state: MigrationOptions;
  dispatch: Dispatch<Action>;
}

const MigrationOptionsForm = ({
  addRowText,
  onSubmit,
  submitText,
  title,
  state,
  dispatch,
}: MigrationOptionsFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const styles = getStyles();
  return (
    <>
      <Innholdstittel>{title}</Innholdstittel>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          setIsLoading(true);
          onSubmit().then((result) => {
            setIsLoading(false);
            return result;
          });
        }}
      >
        {Object.keys(state).map((id) => {
          const { key } = state[id];
          return (
            <Fragment key={id}>
              <Input
                className={styles.hasMarginBottom}
                label="Feltnavn"
                type="text"
                onChange={(event) =>
                  dispatch({
                    type: "edit",
                    payload: {
                      id,
                      key: event.target.value,
                    },
                  })
                }
              />
              <Input
                className={styles.hasMarginBottom}
                label="Verdi"
                type="text"
                disabled={!key}
                onChange={(event) =>
                  dispatch({
                    type: "edit",
                    payload: {
                      id,
                      value: isJSON(event.target.value) ? JSON.parse(event.target.value) : event.target.value,
                    },
                  })
                }
              />
            </Fragment>
          );
        })}
        <div>
          <Knapp
            className={styles.hasMarginBottom}
            onClick={() => {
              dispatch({ type: "add" });
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

export default MigrationOptionsForm;

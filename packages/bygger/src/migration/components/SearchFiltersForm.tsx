import { makeStyles } from "@material-ui/styles";
import { guid } from "nav-frontend-js-utils";
import { Knapp } from "nav-frontend-knapper";
import { Input, Select } from "nav-frontend-skjema";
import { Innholdstittel } from "nav-frontend-typografi";
import React, { Dispatch, Fragment, useReducer } from "react";
import { MigrationMap, MigrationOptions, Operator, SearchFilter, SearchFilters } from "../../../types/migration";

const getStyles = makeStyles({
  form: {
    display: "grid",
    gridTemplateColumns: "4fr 1fr 4fr",
    gap: "0.25rem 1rem",
    marginBottom: "2rem",
  },
  hasMarginBottom: {
    marginBottom: "1rem",
  },
});

const createMigrationOptions = (options: MigrationMap = {}): MigrationOptions => {
  const migrationOptions: MigrationOptions = {};
  if (Object.keys(options).length > 0) {
    for (const [key, value] of Object.entries(options)) {
      Object.assign(migrationOptions, createMigrationOption(key, value));
    }
  } else {
    Object.assign(migrationOptions, createMigrationOption());
  }

  return migrationOptions;
};

const createMigrationOption = (key = "", value = ""): MigrationOptions => ({
  [guid()]: {
    key: key,
    value: value,
  },
});

type Action =
  | { type: "add" }
  | {
      type: "edit";
      payload: { id: string } & Partial<SearchFilter>;
    };

const reducer = (state: SearchFilters = {}, action: Action) => {
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

export const useMigrationOptions = (options: MigrationMap) =>
  useReducer(reducer, {}, () => createMigrationOptions(options));

interface SearchFiltersFormProps {
  title: string;
  addRowText: string;
  state: MigrationOptions;
  dispatch: Dispatch<Action>;
}

type OperatorOptions = Record<Operator, { value: Operator; displayValue: string }>;

const operators: OperatorOptions = {
  eq: { value: "eq", displayValue: "EQ" },
  n_eq: { value: "n_eq", displayValue: "NOT EQ" },
  exists: { value: "exists", displayValue: "eksisterer" },
  n_exists: { value: "n_exists", displayValue: "eksisterer ikke" },
};

const SearchFiltersForm = ({ addRowText, title, state, dispatch }: SearchFiltersFormProps) => {
  const styles = getStyles();
  return (
    <>
      <Innholdstittel tag="h2" className={styles.hasMarginBottom}>
        {title}
      </Innholdstittel>
      <div className={styles.form}>
        {Object.keys(state).map((id) => {
          const { key, value } = state[id];

          return (
            <Fragment key={id}>
              <Input
                className={styles.hasMarginBottom}
                label="Feltnavn"
                type="text"
                value={key}
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
              <Select
                label="Operator"
                onChange={(event) =>
                  dispatch({
                    type: "edit",
                    payload: {
                      id,
                      operator: event.currentTarget.value as Operator,
                    },
                  })
                }
              >
                {Object.values(operators).map(({ value, displayValue }) => (
                  <option key={value} value={value}>
                    {displayValue}
                  </option>
                ))}
                {/*<option value="contains">Inneholder</option>*/}
                {/*<option value="more_than">{">"}</option>*/}
                {/*<option value="more_than_or-equal">{">="}</option>*/}
                {/*<option value="less_than">{"<"}</option>*/}
                {/*<option value="less_than_or-equal">{"<="}</option>*/}
              </Select>
              <Input
                className={styles.hasMarginBottom}
                label="Verdi"
                type="text"
                value={typeof value === "object" ? JSON.stringify(value) : value}
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
      </div>
    </>
  );
};

export default SearchFiltersForm;

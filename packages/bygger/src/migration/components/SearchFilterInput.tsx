import { makeStyles } from "@material-ui/styles";
import { Input, Select } from "nav-frontend-skjema";
import React, { Dispatch, Fragment } from "react";
import { MigrationOption, Operator } from "../../../types/migration";
import { isJSON } from "../utils";
import { Action } from "./MigrationOptionsForm.reducer";

const useStyles = makeStyles({
  input: {
    marginBottom: "1rem",
  },
});

type OperatorOptions = Record<Operator, { value: Operator; displayValue: string }>;
const operators: OperatorOptions = {
  eq: { value: "eq", displayValue: "EQ" },
  n_eq: { value: "n_eq", displayValue: "NOT EQ" },
  exists: { value: "exists", displayValue: "eksisterer" },
  n_exists: { value: "n_exists", displayValue: "eksisterer ikke" },
};

interface SearchFilterInputProps {
  id: string;
  searchFilter: MigrationOption;
  dispatch: Dispatch<Action>;
}

const SearchFilterInput = ({ id, searchFilter, dispatch }: SearchFilterInputProps) => {
  const styles = useStyles();
  const { key, value, operator } = searchFilter;

  return (
    <Fragment>
      <Input
        className={styles.input}
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
        className={styles.input}
        label="Operator"
        value={operator || "eq"}
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
      </Select>
      <Input
        className={styles.input}
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
};

export default SearchFilterInput;

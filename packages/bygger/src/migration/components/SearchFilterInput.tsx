import { makeStyles } from "@material-ui/styles";
import { migrationUtils, Operator } from "@navikt/skjemadigitalisering-shared-domain";
import { Input, Select } from "nav-frontend-skjema";
import React, { Dispatch, Fragment } from "react";
import { MigrationOption } from "../../../types/migration";
import { isJSON } from "../utils";
import DeleteButton from "./DeleteButton";
import { Action } from "./MigrationOptionsForm.reducer";

const useStyles = makeStyles({
  input: {
    marginBottom: "1rem",
  },
  deleteButton: {
    marginBottom: "0.8rem",
  },
});

type OperatorOptions = Record<Operator, string>;
const operators: OperatorOptions = {
  eq: "Er lik",
  n_eq: "Ikke lik",
  contains: "Inneholder",
  n_contains: "Ikke inneholder",
  exists: "Eksisterer",
  n_exists: "Ikke eksisterer",
};

interface SearchFilterInputProps {
  id: string;
  searchFilter: MigrationOption;
  dispatch: Dispatch<Action>;
}

const SearchFilterInput = ({ id, searchFilter, dispatch }: SearchFilterInputProps) => {
  const styles = useStyles();
  const { key, value, operator } = searchFilter;

  const isValueInputDisabled = !key || migrationUtils.isUnaryOperator(operator);

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
              operator: event.target.value as Operator,
              value: migrationUtils.isUnaryOperator(event.target.value as Operator) ? "" : value,
            },
          })
        }
      >
        {Object.entries(operators).map(([key, displayValue]) => (
          <option key={key} value={key}>
            {displayValue}
          </option>
        ))}
      </Select>
      <Input
        className={styles.input}
        label="Verdi"
        type="text"
        value={typeof value === "object" ? JSON.stringify(value) : value}
        disabled={isValueInputDisabled}
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
      <DeleteButton className={styles.deleteButton} onClick={() => dispatch({ type: "remove", payload: { id } })} />
    </Fragment>
  );
};

export default SearchFilterInput;

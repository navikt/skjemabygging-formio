import { makeStyles } from "@material-ui/styles";
import { migrationUtils, Operator } from "@navikt/skjemadigitalisering-shared-domain";
import { Input, Select } from "nav-frontend-skjema";
import React, { Dispatch, Fragment } from "react";
import { MigrationOption } from "../../../types/migration";
import { isJSON } from "../utils";
import { Action } from "./MigrationOptionsForm.reducer";

const useStyles = makeStyles({
  input: {
    marginBottom: "1rem",
  },
});

type OperatorOptions = Record<Operator, string>;
const operators: OperatorOptions = {
  eq: "Er lik",
  n_eq: "Ikke lik",
  contains: "Inneholder",
  n_contains: "Ikke inneholder",
  ex: "Eksisterer",
  n_ex: "Ikke eksisterer",
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
        disabled={!key || migrationUtils.isUnaryOperator(operator)}
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

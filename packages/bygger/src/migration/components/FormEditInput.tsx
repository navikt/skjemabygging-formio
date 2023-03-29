import { makeStyles } from "@material-ui/styles";
import { TextField } from "@navikt/ds-react";
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

interface FormEditInputProps {
  id: string;
  formEdit: MigrationOption;
  dispatch: Dispatch<Action>;
}

const FormEditInput = ({ id, formEdit, dispatch }: FormEditInputProps) => {
  const styles = useStyles();
  const { key, value } = formEdit;
  return (
    <Fragment>
      <TextField
        className={styles.input}
        label="Feltnavn"
        type="text"
        value={formEdit.key}
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
      <TextField
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
      <DeleteButton className={styles.deleteButton} onClick={() => dispatch({ type: "remove", payload: { id } })} />
    </Fragment>
  );
};

export default FormEditInput;

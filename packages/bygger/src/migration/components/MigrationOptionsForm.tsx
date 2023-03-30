import { makeStyles } from "@material-ui/styles";
import { Button, Heading } from "@navikt/ds-react";
import { Dispatch } from "react";
import { Action } from "./MigrationOptionsForm.reducer";

const getStyles = makeStyles({
  form: {
    marginBottom: "3rem",
  },
});

interface MigrationOptionsFormProps {
  title: string;
  addRowText: string;
  dispatch: Dispatch<Action>;
  children: JSX.Element;
}

const MigrationOptionsForm = ({ addRowText, title, dispatch, children }: MigrationOptionsFormProps) => {
  const styles = getStyles();
  return (
    <>
      <Heading level="2" size="large">
        {title}
      </Heading>
      <div className={styles.form}>
        {children}
        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              dispatch({ type: "add" });
            }}
          >
            {addRowText}
          </Button>
        </div>
      </div>
    </>
  );
};

export default MigrationOptionsForm;

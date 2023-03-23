import { makeStyles } from "@material-ui/styles";
import { Knapp } from "nav-frontend-knapper";
import { Innholdstittel } from "nav-frontend-typografi";
import React, { Dispatch } from "react";
import { Action } from "./MigrationOptionsForm.reducer";

const getStyles = makeStyles({
  form: {
    marginBottom: "3rem",
  },
  heading: {
    marginBottom: "1rem",
  },
});

export type TestId = "search-filters" | "dependency-filters" | "edit-options";
interface MigrationOptionsFormProps {
  title: string;
  addRowText: string;
  dispatch: Dispatch<Action>;
  testId: TestId;
  children: JSX.Element;
}

const MigrationOptionsForm = ({ addRowText, title, dispatch, testId, children }: MigrationOptionsFormProps) => {
  const styles = getStyles();
  return (
    <div data-testid={testId}>
      <Innholdstittel tag="h2" className={styles.heading}>
        {title}
      </Innholdstittel>
      <div className={styles.form}>
        {children}
        <div>
          <Knapp
            onClick={() => {
              dispatch({ type: "add" });
            }}
            htmlType="button"
          >
            {addRowText}
          </Knapp>
        </div>
      </div>
    </div>
  );
};

export default MigrationOptionsForm;

import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { Sidetittel } from "nav-frontend-typografi";
import React from "react";
import { useLanguages } from "../../context/languages";

export interface Props {
  form: NavFormType;
  className?: string;
}
const useStyles = makeStyles({
  maxContentWidth: {
    maxWidth: "960px",
    margin: "0 auto",
  },
  titleHeader: {
    padding: "1.5rem 0",
    borderBottom: "4px solid #99c4dd",
  },
  formNumber: {
    color: "#4F4F4F",
    margin: "0.5rem 0 0 0",
    fontSize: "0.875rem",
  },
});

export function FormTitle({ form, className }: Props) {
  const { translate } = useLanguages();
  const styles = useStyles();

  return (
    <header className={styles.titleHeader}>
      <div className={styles.maxContentWidth}>
        <Sidetittel>{translate(form.title)}</Sidetittel>
        {form.properties && form.properties.skjemanummer && (
          <p className={styles.formNumber}>{form.properties.skjemanummer}</p>
        )}
      </div>
    </header>
  );
}

import React from "react";
import { Input } from "nav-frontend-skjema";
import { makeStyles } from "@material-ui/styles";
import { Delete } from "@navikt/ds-icons";

const useTranslationRowStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "2rem",
    marginBottom: "1rem",
    alignItems: "center",
  },
});

const GlobalTranslationRow = ({
  originalText,
  translatedText,
  updateTranslation,
  updateOriginalText,
  deleteOneRow,
}) => {
  const classes = useTranslationRowStyles();
  return (
    <div className={classes.root}>
      <Input
        className="margin-bottom-default"
        type="text"
        value={originalText}
        onChange={(event) => {
          updateOriginalText(event.target.value, originalText);
        }}
      />
      <Input
        className="margin-bottom-default"
        type="text"
        value={translatedText}
        onChange={(event) => {
          updateTranslation(originalText, event.target.value);
        }}
      />
      <Delete onClick={deleteOneRow} />
    </div>
  );
};

export default GlobalTranslationRow;

import React, { useState } from "react";
import { Input } from "nav-frontend-skjema";
import { makeStyles } from "@material-ui/styles";
import { Delete } from "@navikt/ds-icons";
import { getAllPredefinedOriginalTexts } from "./utils";

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
  id,
  originalText,
  translatedText,
  updateTranslation,
  updateOriginalText,
  deleteOneRow,
  currentOriginalTextList,
}) => {
  const classes = useTranslationRowStyles();
  const [duplicatedWarning, setDuplicatedWarning] = useState(false);
  return (
    <>
      <div className={classes.root}>
        <Input
          className="margin-bottom-default"
          type="text"
          value={originalText}
          onChange={(event) => {
            updateOriginalText(id, event.target.value, originalText);
            setDuplicatedWarning(false);
          }}
          onBlur={(event) => {
            if (currentOriginalTextList[currentOriginalTextList.length - 1] === event.target.value.toUpperCase()) {
              currentOriginalTextList.pop();
            }

            if (
              getAllPredefinedOriginalTexts().indexOf(event.target.value.toUpperCase()) < 0 &&
              currentOriginalTextList.indexOf(event.target.value.toUpperCase()) < 0
            ) {
              setDuplicatedWarning(false);
            } else {
              setDuplicatedWarning(true);
            }
          }}
        />
        <Input
          className="margin-bottom-default"
          type="text"
          value={translatedText}
          disabled={duplicatedWarning}
          onChange={(event) => {
            updateTranslation(id, originalText, event.target.value);
          }}
        />
        <Delete onClick={() => deleteOneRow(id)} />
      </div>
      {duplicatedWarning && <div className="form-text error">Duplisert originaltekst</div>}
    </>
  );
};

export default GlobalTranslationRow;

import React, { useState } from "react";
import { Input } from "nav-frontend-skjema";
import { makeStyles } from "@material-ui/styles";
import { Delete } from "@navikt/ds-icons";
import { getAllPredefinedOriginalTexts } from "./utils";

const useTranslationRowStyles = makeStyles({
  warning: {
    color: "#ba3a26",
    fontWeight: 600,
    lineHeight: "1.375rem",
    marginTop: "-2rem",
    marginBottom: "1rem",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "2rem",
    alignItems: "center",
    marginBottom: "1rem",
  },
});

const removeLastUpdatedOriginalText = (currentOriginalText, currentOriginalTextList) => {
  if (currentOriginalTextList[currentOriginalTextList.length - 1] === currentOriginalText.toUpperCase()) {
    currentOriginalTextList.pop();
  }
};

type Props = {
  id: string;
  originalText: string;
  translatedText: string;
  updateTranslation: Function;
  updateOriginalText: Function;
  deleteOneRow: Function;
  currentOriginalTextList: string[];
};

const GlobalTranslationRow = ({
  id,
  originalText,
  translatedText,
  updateTranslation,
  updateOriginalText,
  deleteOneRow,
  currentOriginalTextList,
}: Props) => {
  const classes = useTranslationRowStyles();
  const [duplicatedWarning, setDuplicatedWarning] = useState(false);
  return (
    <div>
      <div className={classes.row}>
        <Input
          className="margin-bottom-default"
          type="text"
          value={originalText}
          data-testid="originalText"
          onChange={(event) => {
            updateOriginalText(id, event.target.value, originalText);
            setDuplicatedWarning(false);
          }}
          onBlur={(event) => {
            removeLastUpdatedOriginalText(event.target.value, currentOriginalTextList);

            if (
              getAllPredefinedOriginalTexts().indexOf(event.target.value.toUpperCase()) < 0 &&
              currentOriginalTextList.indexOf(event.target.value.toUpperCase()) < 0
            ) {
              setDuplicatedWarning(false);
            } else {
              setDuplicatedWarning(true);
              updateTranslation(id, originalText, "");
            }
          }}
        />
        <Input
          className="margin-bottom-default"
          type="text"
          value={duplicatedWarning ? "" : translatedText}
          data-testid="translation"
          disabled={duplicatedWarning}
          onChange={(event) => {
            updateTranslation(id, originalText, event.target.value);
          }}
        />
        <Delete onClick={() => deleteOneRow(id)} />
      </div>
      {duplicatedWarning && <div className={classes.warning}>Duplisert originaltekst</div>}
    </div>
  );
};

export default GlobalTranslationRow;

import { makeStyles } from "@material-ui/styles";
import { Delete } from "@navikt/ds-icons";
import { Textarea } from "nav-frontend-skjema";
import React, { useState } from "react";

const useTranslationRowStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "2rem",
  },
  warning: {
    color: "#ba3a26",
    fontWeight: 600,
    lineHeight: "1.375rem",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "2rem",
    alignItems: "flex-start",
  },
});

type Props = {
  id: string;
  originalText: string;
  translatedText: string;
  updateTranslation: Function;
  updateOriginalText: Function;
  deleteOneRow: Function;
  currentOriginalTextList: string[];
  predefinedGlobalOriginalTexts: string[];
};

const GlobalTranslationRow = ({
  id,
  originalText,
  translatedText,
  updateTranslation,
  updateOriginalText,
  deleteOneRow,
  currentOriginalTextList,
  predefinedGlobalOriginalTexts,
}: Props) => {
  const classes = useTranslationRowStyles();
  const [duplicatedWarning, setDuplicatedWarning] = useState(false);
  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <Textarea
          value={originalText}
          data-testid="originalText"
          maxLength={0}
          onChange={(event) => {
            updateOriginalText(id, event.target.value, originalText);
            setDuplicatedWarning(false);
          }}
          onBlur={(event) => {
            if (predefinedGlobalOriginalTexts.indexOf(event.target.value.toUpperCase()) < 0) {
              if (
                currentOriginalTextList.filter((originalText) => originalText === event.target.value.toUpperCase())
                  .length > 1
              ) {
                currentOriginalTextList.pop();

                if (currentOriginalTextList.indexOf(event.target.value.toUpperCase()) >= 0) {
                  setDuplicatedWarning(true);
                }
              }
            } else {
              setDuplicatedWarning(true);
            }
          }}
        />
        <Textarea
          value={translatedText}
          data-testid="translation"
          disabled={duplicatedWarning}
          maxLength={0}
          onChange={(event) => {
            updateTranslation(id, originalText, event.target.value);
          }}
        />
        <Delete onClick={() => deleteOneRow(id)} />
      </div>
      {duplicatedWarning && <div className={classes.warning}>Denne teksten er allerede oversatt.</div>}
    </div>
  );
};

export default GlobalTranslationRow;

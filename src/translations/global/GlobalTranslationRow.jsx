import React from "react";
import { Input } from "nav-frontend-skjema";
import { makeStyles } from "@material-ui/styles";

const useTranslationRowStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    marginBottom: "2rem",
  },
});

const GlobalTranslationRow = ({ originalText, translatedText, languageCode, updateTranslation }) => {
  const classes = useTranslationRowStyles();
  return (
    <div className={classes.root}>
      <Input
        className="margin-bottom-default"
        label="Originaltekst"
        type="text"
        value={originalText}
        onChange={(event) => {
          if (event.target.value && event.target.value !== "") {
            updateTranslation(event.target.value, translatedText, languageCode);
          }
        }}
      />
      <Input
        className="margin-bottom-default"
        label="Oversatt tekst"
        type="text"
        value={translatedText}
        onChange={(event) => {
          if (event.target.value && event.target.value !== "") {
            updateTranslation(originalText, event.target.value, languageCode);
          }
        }}
      />
    </div>
  );
};

export default GlobalTranslationRow;

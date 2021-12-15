import { makeStyles } from "@material-ui/styles";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import React from "react";
import { useLanguages } from "../context/languages";

const useLoadingStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    "& h1": {
      fontSize: "3rem",
      fontWeight: "bolder",
    },
  },
});

const LoadingComponent = () => {
  const { translate } = useLanguages();
  const classes = useLoadingStyles();
  return (
    <div className={classes.root}>
      <h1>{translate ? translate(TEXTS.statiske.loading) : TEXTS.statiske.loading}</h1>
    </div>
  );
};

export default LoadingComponent;

import { makeStyles } from "@material-ui/styles";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useLanguages } from "../context/languages";

const useLoadingStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    height: (offset) => `calc(100vh - ${offset}rem)`,
    "& h1": {
      fontSize: "3rem",
      fontWeight: "bolder",
    },
  },
});

const LoadingComponent = ({ heightOffset = 0 }) => {
  const { translate } = useLanguages();
  const classes = useLoadingStyles(heightOffset);
  return (
    <div className={classes.root}>
      <h1>{translate ? translate(TEXTS.statiske.loading) : TEXTS.statiske.loading}</h1>
    </div>
  );
};

export default LoadingComponent;

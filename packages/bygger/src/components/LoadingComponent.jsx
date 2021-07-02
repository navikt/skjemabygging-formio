import React from "react";
import { makeStyles } from "@material-ui/styles";

const useLoadingStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
    "& h1": {
      fontSize: "3rem",
      fontWeight: "bolder",
    },
  },
});

const LoadingComponent = () => {
  const classes = useLoadingStyles();
  return (
    <div className={classes.root}>
      <h1>Laster...</h1>
    </div>
  );
};

export default LoadingComponent;

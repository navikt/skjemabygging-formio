import { makeStyles } from "@material-ui/styles";
import React from "react";

const useLoadingStyles = makeStyles({
  root: {
    display: "flex",
    height: "100vh",
  },
});

interface ErrorPageProps {
  errorMessage: string;
}

const ErrorPage = ({ errorMessage }: ErrorPageProps) => {
  const classes = useLoadingStyles();
  return (
    <div className={classes.root}>
      <h1>{errorMessage}</h1>
    </div>
  );
};

export default ErrorPage;

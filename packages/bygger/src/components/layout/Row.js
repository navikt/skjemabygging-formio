import React from "react";
import classNames from "classnames";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: "1.5rem",
    margin: "0 auto",

    "@media screen and (min-width: 51.25rem)": {
      gridTemplateColumns: "12.875rem minmax(21rem, 50rem) 10.625rem",
      gap: "1.5rem",
      maxWidth: "77.5rem",
    },
  },
});

const Row = ({ children, className }) => {
  const styles = useStyles();

  return (
    <div
      className={classNames(styles.root, {
        [className]: className,
      })}
    >
      {children}
    </div>
  );
};

export default Row;

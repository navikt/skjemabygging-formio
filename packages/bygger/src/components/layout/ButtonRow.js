import React from "react";
import classNames from "classnames";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";

const useStyles = makeStyles({
  buttonRow: {
    listStyle: "none",
    padding: "0",
    margin: "0",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",

    "& > *:not(:last-child)": {
      marginRight: "1.5rem",
    },
  },
});

const ButtonRow = ({ children, className }) => {
  const styles = useStyles();
  return (
    <ul
      className={classNames(styles.buttonRow, {
        [className]: className,
      })}
    >
      {children.map((child) => (
        <li>{child}</li>
      ))}
    </ul>
  );
};

export default ButtonRow;

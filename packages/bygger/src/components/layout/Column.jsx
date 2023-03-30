import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import classNames from "classnames";

const useStyles = makeStyles({
  column: {
    display: "flex",
    flexDirection: "column",

    "& > *": {
      marginBottom: "1rem",
    },
  },
});

const Column = ({ children, className = "" }) => {
  const styles = useStyles();
  return (
    <div
      className={classNames(styles.column, {
        [className]: className,
      })}
    >
      {children}
    </div>
  );
};

export default Column;

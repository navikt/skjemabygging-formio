import { makeStyles } from "@material-ui/styles";
import { Delete } from "@navikt/ds-icons";
import React from "react";

const useStyles = makeStyles({
  iconWrapper: {
    height: "2.5rem",
    display: "flex",
    alignSelf: "end",
    alignItems: "center",
    justifySelf: "end",
  },
  icon: {
    cursor: "pointer",
  },
});

const DeleteButton = ({ className, onClick }) => {
  const styles = useStyles();
  return (
    <div className={`${className} ${styles.iconWrapper}`}>
      <Delete className={styles.icon} fontSize={"1.5rem"} onClick={onClick} />
    </div>
  );
};

export default DeleteButton;

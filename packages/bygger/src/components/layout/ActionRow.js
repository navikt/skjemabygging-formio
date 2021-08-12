import React from "react";
import ButtonRow from "./ButtonRow";
import Row from "./Row";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";

const useStyles = makeStyles({
  actionRow: {
    padding: "2rem 0",
  },
  centerColumn: {
    gridColumn: "2 / 3",
  },
});

const ActionRow = ({ children }) => {
  const styles = useStyles();
  return (
    <Row className={styles.actionRow}>
      <ButtonRow>{children}</ButtonRow>
    </Row>
  );
};

export default ActionRow;

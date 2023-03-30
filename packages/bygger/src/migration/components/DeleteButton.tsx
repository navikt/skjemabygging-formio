import { makeStyles } from "@material-ui/styles";
import { Delete } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import React from "react";

const useStyles = makeStyles({
  button: {
    height: "fit-content",
    minWidth: "fit-content",
    alignSelf: "end",
  },
});

const DeleteButton = ({ className, onClick }: { className?: string; onClick: () => void }) => {
  const styles = useStyles();
  return (
    <Button
      className={`${styles.button} ${className}`}
      type="button"
      variant="tertiary"
      icon={<Delete aria-hidden />}
      onClick={onClick}
    ></Button>
  );
};

export default DeleteButton;
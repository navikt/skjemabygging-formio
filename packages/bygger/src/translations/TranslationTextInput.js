import { Input, Textarea } from "nav-frontend-skjema";
import { Locked, Unlocked } from "@navikt/ds-icons";
import React from "react";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  list: {
    display: "flex",
    alignItems: "center",
    "& .textarea--medMeta__teller": {
      display: "none",
    },
    "& textarea": {
      width: "inherit",
    },
    "& textarea:read-only": {
      borderColor: "#78706a",
      backgroundColor: "#e9e7e7",
      cursor: "not-allowed",
    },
    "& .skjemaelement": {
      width: "100%",
    },
  },
  padLockIcon: {
    marginTop: "2rem",
    marginLeft: "-20px",
    zIndex: "1",
    cursor: "pointer",
  },
});

const TranslationTextInput = ({
  text,
  value,
  type,
  hasGlobalTranslation,
  tempGlobalTranslation,
  showGlobalTranslation,
  onChange,
  setHasGlobalTranslation,
  setGlobalTranslation,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.list}>
      {type === "textarea" ? (
        <Textarea
          className="margin-bottom-default"
          label={text}
          value={value}
          description={hasGlobalTranslation ? "Denne teksten er global oversatt" : undefined}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          readOnly={hasGlobalTranslation}
        />
      ) : (
        <Input
          className="margin-bottom-default"
          label={text}
          type={type}
          value={value}
          description={hasGlobalTranslation ? "Denne teksten er global oversatt" : undefined}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          readOnly={hasGlobalTranslation}
        />
      )}
      {showGlobalTranslation ? (
        hasGlobalTranslation ? (
          <Locked
            className={classes.padLockIcon}
            onClick={() => {
              setHasGlobalTranslation(!hasGlobalTranslation);
              setGlobalTranslation("");
            }}
          />
        ) : (
          <Unlocked
            className={classes.padLockIcon}
            onClick={() => {
              setHasGlobalTranslation(!hasGlobalTranslation);
              setGlobalTranslation(tempGlobalTranslation);
            }}
          />
        )
      ) : (
        ""
      )}
    </div>
  );
};
export default TranslationTextInput;

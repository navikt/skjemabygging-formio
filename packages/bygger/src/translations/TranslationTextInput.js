import { Input, Textarea } from "nav-frontend-skjema";
import { Locked, Unlocked } from "@navikt/ds-icons";
import React from "react";
import { makeStyles } from "@material-ui/styles";

const padLockIconStyle = {
  marginLeft: "-20px",
  zIndex: "1",
  cursor: "pointer",
};
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
  lockedIcon: {
    ...padLockIconStyle,
    marginTop: "2.5rem",
  },
  unlockedIcon: {
    ...padLockIconStyle,
    marginTop: "1rem",
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
          description={hasGlobalTranslation ? "Denne teksten er globalt oversatt" : undefined}
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
          description={hasGlobalTranslation ? "Denne teksten er globalt oversatt" : undefined}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          readOnly={hasGlobalTranslation}
        />
      )}
      {showGlobalTranslation ? (
        hasGlobalTranslation ? (
          <Locked
            title="Lås opp for å overstyre global oversettelse"
            className={classes.lockedIcon}
            onClick={() => {
              setHasGlobalTranslation(!hasGlobalTranslation);
              setGlobalTranslation("");
            }}
          />
        ) : (
          <Unlocked
            title="Bruk global oversettelse"
            className={classes.unlockedIcon}
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

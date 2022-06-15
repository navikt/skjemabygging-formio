import { makeStyles } from "@material-ui/styles";
import { Locked, Unlocked } from "@navikt/ds-icons";
import { Input, Textarea } from "nav-frontend-skjema";
import React from "react";
import { DebounceInput } from "react-debounce-input";

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
  console.log("TEXT", text);
  return (
    <div className={classes.list}>
      {type === "textarea" ? (
        <DebounceInput
          element={Textarea}
          debounceTimeout={500}
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
        <DebounceInput
          element={Input}
          debounceTimeout={500}
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

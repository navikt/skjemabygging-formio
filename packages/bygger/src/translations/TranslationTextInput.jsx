import { Locked, Unlocked } from "@navikt/ds-icons";
import { TextField, Textarea } from "@navikt/ds-react";
import { makeStyles } from "@navikt/skjemadigitalisering-shared-components";
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
  },
  element: {
    width: "100%",
    marginBottom: "1rem",
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
        <DebounceInput
          element={Textarea}
          debounceTimeout={500}
          className={classes.element}
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
          element={TextField}
          debounceTimeout={500}
          className={classes.element}
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

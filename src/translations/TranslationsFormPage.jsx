import React, { useEffect, useState } from "react";
import { Sidetittel } from "nav-frontend-typografi";
import { Input, Textarea } from "nav-frontend-skjema";
import { Locked, Unlocked } from "@navikt/ds-icons";
import { makeStyles } from "@material-ui/styles";

const useTranslationsListStyles = makeStyles({
  root: {
    width: "80ch",
    margin: "0 auto",
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
  list: {
    display: "flex",
    alignItems: "center",

    "& .skjemaelement": {
      width: "100%",
    },
  },
  listItem: {
    marginTop: "2rem",
    marginLeft: "-20px",
    zIndex: "1",
    cursor: "pointer",
  },
});

const FormItem = ({ translations, setTranslations, text, type }) => {
  const [showGlobalTranslation, setShowGlobalTranslation] = useState(false);
  const [hasGlobalTranslation, setHasGlobalTranslation] = useState(false);
  const [globalTranslation, setGlobalTranslation] = useState("");
  const classes = useTranslationsListStyles();

  useEffect(() => {
    if (translations && translations[text] && translations[text].scope === "global") {
      setHasGlobalTranslation(true);
      setShowGlobalTranslation(true);
      setGlobalTranslation(translations[text].value);
    }
  }, [translations, setTranslations, text]);

  return (
    <div className={classes.list}>
      {type === "textarea" ? (
        <Textarea
          label={text}
          className="margin-bottom-default"
          key={text}
          description={hasGlobalTranslation ? "Denne teksten er global oversatt" : undefined}
          value={(translations && translations[text] && translations[text].value) || ""}
          onChange={(event) => {
            setTranslations({
              ...translations,
              [text]: { value: event.target.value, scope: "local" },
            });
            setGlobalTranslation(event.target.value);
          }}
          readOnly={hasGlobalTranslation}
        />
      ) : (
        <Input
          className="margin-bottom-default"
          key={text}
          description={hasGlobalTranslation ? "Denne teksten er global oversatt" : undefined}
          label={text}
          type={type}
          value={
            showGlobalTranslation ? globalTranslation : translations && translations[text] && translations[text].value
          }
          onChange={(event) => {
            setTranslations({
              ...translations,
              [text]: { value: event.target.value, scope: "local" },
            });
            setGlobalTranslation(event.target.value);
          }}
          readOnly={hasGlobalTranslation}
        />
      )}
      {showGlobalTranslation ? (
        hasGlobalTranslation ? (
          <Locked
            className={classes.listItem}
            onClick={() => {
              setHasGlobalTranslation(!hasGlobalTranslation);
              setGlobalTranslation("");
            }}
          />
        ) : (
          <Unlocked
            className={classes.listItem}
            onClick={() => {
              setGlobalTranslation(translations && translations[text] && translations[text].value);
              setHasGlobalTranslation(!hasGlobalTranslation);
            }}
          />
        )
      ) : (
        ""
      )}
    </div>
  );
};
const TranslationsFormPage = ({ skjemanummer, translations, title, flattenedComponents, setTranslations }) => {
  const classes = useTranslationsListStyles();

  return (
    <div className={classes.root}>
      <Sidetittel className="margin-bottom-default">{title}</Sidetittel>
      <p className="margin-bottom-large">{skjemanummer}</p>
      <form>
        <Input
          className="margin-bottom-default"
          label={title}
          type={"text"}
          key={title}
          value={(translations[title] && translations[title].value) || ""}
          onChange={(event) =>
            setTranslations({
              ...translations,
              [title]: { value: event.target.value, scope: "local" },
            })
          }
        />
        {flattenedComponents.map(({ text, type }) => {
          return (
            <FormItem
              translations={translations}
              setTranslations={setTranslations}
              text={text}
              type={type}
              key={text}
            />
          );
        })}
      </form>
    </div>
  );
};
export default TranslationsFormPage;

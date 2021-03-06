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

const FormItem = ({ currentTranslation, setTranslations, text, type, languageCode, translations }) => {
  const [showGlobalTranslation, setShowGlobalTranslation] = useState(false);
  const [hasGlobalTranslation, setHasGlobalTranslation] = useState(false);
  const [globalTranslation, setGlobalTranslation] = useState("");
  const [tempGlobalTranslation, setTempGlobalTranslation] = useState("");
  const classes = useTranslationsListStyles();

  useEffect(() => {
    if (currentTranslation && currentTranslation[text]) {
      if (currentTranslation[text].scope === "global") {
        setHasGlobalTranslation(true);
        setShowGlobalTranslation(true);
        setTempGlobalTranslation(currentTranslation[text].value);
      }
      setGlobalTranslation(currentTranslation[text].value);
    } else {
      setGlobalTranslation("");
      setHasGlobalTranslation(false);
      setShowGlobalTranslation(false);
    }
  }, [currentTranslation, setTranslations, text]);

  const updateTranslations = (targetValue) => {
    setTranslations({
      ...translations,
      [languageCode]: {
        ...translations[languageCode],
        translations: {
          ...currentTranslation,
          [text]: { value: targetValue, scope: "local" },
        },
      },
    });
    setGlobalTranslation(targetValue);
  };

  return (
    <div className={classes.list}>
      {type === "textarea" ? (
        <Textarea
          label={text}
          className="margin-bottom-default"
          key={`${text}-${languageCode}`}
          description={hasGlobalTranslation ? "Denne teksten er global oversatt" : undefined}
          value={globalTranslation}
          onChange={(event) => {
            updateTranslations(event.target.value);
          }}
          readOnly={hasGlobalTranslation}
        />
      ) : (
        <Input
          className="margin-bottom-default"
          key={`${text}-${languageCode}`}
          description={hasGlobalTranslation ? "Denne teksten er global oversatt" : undefined}
          label={text}
          type={type}
          value={globalTranslation}
          onChange={(event) => {
            updateTranslations(event.target.value);
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
const TranslationsFormPage = ({
  skjemanummer,
  translations,
  title,
  flattenedComponents,
  setTranslations,
  languageCode,
}) => {
  const classes = useTranslationsListStyles();
  const [currentTranslation, setCurrentTranslation] = useState({});

  useEffect(
    () => setCurrentTranslation((translations[languageCode] && translations[languageCode].translations) || {}),
    [translations, languageCode]
  );

  return (
    <div className={classes.root}>
      <Sidetittel className="margin-bottom-default">{title}</Sidetittel>
      <p className="margin-bottom-large">{skjemanummer}</p>
      <form>
        <Input
          className="margin-bottom-default"
          label={title}
          type={"text"}
          key={`title-${title}`}
          value={(currentTranslation[title] && currentTranslation[title].value) || ""}
          onChange={(event) => {
            setTranslations({
              ...translations,
              [languageCode]: {
                ...translations[languageCode],
                translations: {
                  ...currentTranslation,
                  [title]: { value: event.target.value, scope: "local" },
                },
              },
            });
          }}
        />
        {flattenedComponents.map(({ text, type }) => {
          return (
            <FormItem
              currentTranslation={currentTranslation}
              translations={translations}
              setTranslations={setTranslations}
              text={text}
              type={type}
              key={`translation-${skjemanummer}-${text}-${languageCode}`}
              languageCode={languageCode}
            />
          );
        })}
      </form>
    </div>
  );
};
export default TranslationsFormPage;

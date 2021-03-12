import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { AppLayoutWithContext } from "../components/AppLayout";
import { Link } from "react-router-dom";
import { Innholdstittel } from "nav-frontend-typografi";
import { FormsList } from "../Forms/FormsListPage";

const useTranslationsListStyles = makeStyles({
  root: {
    maxWidth: "50rem",
    margin: "0 auto 2rem",
  },
  list: {
    listStyle: "none",
    padding: "0",
  },
  listItem: {
    padding: "0.3rem 0.5rem",
    display: "grid",
    gridTemplateColumns: "auto 6rem",
    width: "auto",
    "&:nth-child(odd)": {
      backgroundColor: "#ddd",
    },
  },
});

const TranslationsList = ({ translations }) => {
  const classes = useTranslationsListStyles();
  const globalTranslations = translations.filter((translation) => translation.scope === "global");
  const localTranslations = translations.filter((translation) => translation.scope === "local");
  return (
    <div className={classes.root}>
      <nav className="margin-bottom-large">
        <Innholdstittel className="margin-bottom-default">Fellesoversettelser</Innholdstittel>
        <ul className={classes.list}>
          {globalTranslations.map((translation) => (
            <li className={classes.listItem} key={translation.id}>
              <a href={`/translation/${translation.id}`}>
                {translation.title || translation.id} ({translation.language})
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav className="margin-bottom-large">
        <Innholdstittel className="margin-bottom-default">Skjemaoversettelser</Innholdstittel>
        <ul className={classes.list}>
          {localTranslations.map((translation) => (
            <li className={classes.listItem} key={translation.id}>
              <a href={`/translation/${translation.id}`}>
                {translation.title || translation.id} ({translation.language})
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export function TranslationsListPage({ onLogout, loadLanguages, projectURL, forms }) {
  const classes = useTranslationsListStyles();
  const [translations, setTranslations] = useState();
  useEffect(() => {
    loadLanguages()
      .then((response) => {
        console.log(response);
        return response;
      })
      .then((response) => setTranslations(response));
  }, [loadLanguages, setTranslations, forms]);
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Oversettelser",
        visSkjemaliste: true,
        visLagNyttSkjema: false,
        logout: onLogout,
      }}
      mainCol={
        <nav className="list-inline">
          <div className="list-inline-item">
            <Link className="knapp knapp--hoved margin-bottom-large" to="/translation/new">
              Lag ny oversettelse
            </Link>
          </div>
        </nav>
      }
    >
      <main className={classes.root}>
        {translations && (
          <TranslationsList className={classes.list} projectURL={projectURL} translations={translations} />
        )}
        <Innholdstittel className="margin-bottom-default">Skjemaliste</Innholdstittel>
        {forms && (
          <FormsList className={classes.list} forms={forms}>
            {(form) => (
              <li className={classes.listItem} key={form.path}>
                {form.title}
              </li>
            )}
          </FormsList>
        )}
      </main>
    </AppLayoutWithContext>
  );
}

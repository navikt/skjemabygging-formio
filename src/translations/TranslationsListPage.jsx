import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { AppLayoutWithContext } from "../components/AppLayout";
import { Link } from "react-router-dom";
import { SletteKnapp } from "../Forms/components";

const useFormsListPageStyles = makeStyles({
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

const ResourceList = ({ translations }) => {
  const classes = useFormsListPageStyles();
  return (
    <nav className={classes.root}>
      <ul className={classes.list}>
        {translations.map((translation) => (
          <li className={classes.listItem} key={translation.id}>
            <a href={`/translation/${translation.id}`}>
              {translation.title || translation.id} ({translation.language})
            </a>
            <SletteKnapp className="lenke">Slett oversettelser</SletteKnapp>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const useResourceListStyles = makeStyles({
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

export function TranslationsListPage({ onLogout, loadLanguages, projectURL }) {
  const classes = useResourceListStyles();
  const [translations, setTranslations] = useState();
  useEffect(() => {
    loadLanguages()
      .then((response) => {
        console.log(response);
        return response;
      })
      .then((response) => setTranslations(response));
  }, [loadLanguages, setTranslations]);
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
        <nav>
          {translations && (
            <ResourceList className={classes.list} projectURL={projectURL} translations={translations} />
          )}
        </nav>
      </main>
    </AppLayoutWithContext>
  );
}

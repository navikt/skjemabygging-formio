import React from "react";
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

export function TranslationsListPage({ onLogout, forms }) {
  const classes = useTranslationsListStyles();
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Oversettelser",
        visSkjemaliste: true,
        visLagNyttSkjema: false,
        logout: onLogout,
      }}
    >
      <main className={classes.root}>
        <nav className="margin-bottom-large">
          <Innholdstittel className="margin-bottom-default">Globale oversettelser</Innholdstittel>
          <ul className={classes.list}>
            <li className={classes.listItem}>
              <Link to={"/globalTranslations"}>Felles oversettelser for alle skjemaer</Link>
            </li>
          </ul>
        </nav>
        <nav className="margin-bottom-large">
          <Innholdstittel className="margin-bottom-default">Skjemaliste</Innholdstittel>
          {forms && (
            <FormsList className={classes.list} forms={forms}>
              {(form) => (
                <li className={classes.listItem} key={form.path}>
                  <a href={`/translation/${form.path}`}>{form.title}</a>
                </li>
              )}
            </FormsList>
          )}
        </nav>
      </main>
    </AppLayoutWithContext>
  );
}

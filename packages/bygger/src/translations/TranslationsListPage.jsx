import { makeStyles } from "@material-ui/styles";
import { Innholdstittel } from "nav-frontend-typografi";
import React from "react";
import { Link } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import { FormsList, simplifiedForms } from "../Forms/FormsListPage";

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
    gridTemplateColumns: "minmax(5rem,10rem) auto minmax(5rem,10rem)",
    width: "auto",
    "&:nth-child(odd)": {
      backgroundColor: "#ddd",
    },
  },
  globalListItem: {
    padding: "0.3rem 0.5rem",
    width: "auto",
    "&:nth-child(odd)": {
      backgroundColor: "#ddd",
    },
  },
});

export function TranslationsListPage({ forms }) {
  const classes = useTranslationsListStyles();
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Oversettelser",
        visSkjemaliste: true,
        visLagNyttSkjema: false,
      }}
    >
      <main className={classes.root}>
        <nav className="margin-bottom-double">
          <Innholdstittel className="margin-bottom-default">Globale oversettelser</Innholdstittel>
          <ul className={classes.list}>
            <li className={classes.globalListItem}>
              <Link to="/translations/global/nn-NO/skjematekster">Felles oversettelser for alle skjemaer</Link>
            </li>
          </ul>
        </nav>
        <nav className="margin-bottom-large">
          <Innholdstittel className="margin-bottom-default">Skjemaliste</Innholdstittel>
          {forms && (
            <FormsList className={classes.list} forms={simplifiedForms(forms)}>
              {(form) => (
                <li className={classes.listItem} key={form.path}>
                  <Link className="lenke" data-testid="editLink" to={`/translations/${form.path}`}>
                    {form.skjemanummer}
                  </Link>
                  <Link className="lenke" data-testid="editLink" to={`/translations/${form.path}`}>
                    {form.title}
                  </Link>
                </li>
              )}
            </FormsList>
          )}
        </nav>
      </main>
    </AppLayoutWithContext>
  );
}

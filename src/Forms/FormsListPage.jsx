import React from "react";
import { Link } from "react-router-dom";
import { Element, Sidetittel } from "nav-frontend-typografi";
import * as PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { AppLayoutWithContext } from "../components/AppLayout";
import { SlettSkjemaKnapp } from "./components";

const FormsList = ({ forms, children }) => {
  const classes = useFormsListPageStyles();
  return (
    <ul className={classes.list}>
      <li className={classes.listTitle}>
        <Element>Skjemanummer</Element>
        <Element>Skjematittel</Element>
        <Element className={classes.listTitleItem}>Action</Element>
      </li>
      {forms.sort((a, b) => (a.modified < b.modified ? 1 : -1)).map((form) => children(form))}
    </ul>
  );
};

FormsList.propTypes = {
  className: PropTypes.string,
  forms: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      title: PropTypes.string,
      properties: PropTypes.shape({
        skjemanummer: PropTypes.string,
      }),
    })
  ),
};

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
    gridTemplateColumns: "minmax(5rem,10rem) auto minmax(5rem,10rem)",
    width: "auto",
    "&:nth-child(odd)": {
      backgroundColor: "#ddd",
    },
  },
  listTitle: {
    padding: "0.3rem 0.5rem",
    display: "grid",
    gridTemplateColumns: "minmax(5rem,10rem) auto minmax(5rem,10rem)",
    backgroundColor: "#c1c1c1",
  },
  listTitleItem: {
    justifySelf: "center",
  },
});

function simplifiedForms(forms) {
  return forms.map((form) => ({
    modified: form.modified,
    title: form.title,
    path: form.path,
    skjemanummer: form.properties ? (form.properties.skjemanummer ? form.properties.skjemanummer : "") : "",
    tema: form.properties ? (form.properties.tema ? form.properties.tema : "") : "",
  }));
}

export function FormsListPage({ forms, url, onDelete, onNew, onLogout }) {
  const classes = useFormsListPageStyles();
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Skjemaoversikt",
        visSkjemaliste: false,
        visLagNyttSkjema: true,
        logout: onLogout,
        onNew: onNew,
      }}
    >
      <nav className={classes.root}>
        <Sidetittel className="margin-bottom-default">Velg skjema:</Sidetittel>
        <FormsList forms={simplifiedForms(forms)}>
          {(form) => (
            <li className={classes.listItem} key={form.path}>
              <Link className="lenke" data-testid="editLink" to={`${url}/${form.path}/edit`}>
                {form.skjemanummer}
              </Link>
              <Link className="lenke" data-testid="editLink" to={`${url}/${form.path}/edit`}>
                {form.title}
              </Link>
              <SlettSkjemaKnapp className="lenke" onClick={() => onDelete(form)}>
                Slett skjema
              </SlettSkjemaKnapp>
            </li>
          )}
        </FormsList>
      </nav>
    </AppLayoutWithContext>
  );
}

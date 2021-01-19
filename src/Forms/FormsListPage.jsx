import React from "react";
import { Link } from "react-router-dom";
import { Hovedknapp } from "nav-frontend-knapper";
import { Sidetittel } from "nav-frontend-typografi";
import * as PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

import { AppLayoutWithContext } from "../components/AppLayout";
import { SlettSkjemaKnapp } from "./components";

const FormsList = ({ forms, children, className }) => {
  return (
    <ul className={className}>
      {forms.sort((a, b) => (a.modified < b.modified ? 1 : -1)).map((form) => children(form))}
    </ul>
  );
};

FormsList.propTypes = {
  sort: PropTypes.any,
  callbackfn: PropTypes.func,
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
    gridTemplateColumns: "auto 6rem",
    width: "auto",
    "&:nth-child(odd)": {
      backgroundColor: "#eee",
    },
  },
});

export function FormsListPage({ forms, url, onDelete, onNew }) {
  const classes = useFormsListPageStyles();
  return (
    <AppLayoutWithContext navBarProps={{ title: "Skjemabygger", visSkjemaliste: false }}>
      <nav className={classes.root}>
        <Sidetittel className="margin-bottom-default">Velg skjema:</Sidetittel>
        <FormsList className={classes.list} forms={forms}>
          {(form) => (
            <li className={classes.listItem} key={form.path}>
              <Link className="lenke" data-testid="editLink" to={`${url}/${form.path}/edit`}>
                {form.title}
              </Link>
              <SlettSkjemaKnapp className="lenke" onClick={() => onDelete(form)}>
                Slett skjema
              </SlettSkjemaKnapp>
            </li>
          )}
        </FormsList>
        <Hovedknapp onClick={onNew}>Lag nytt skjema</Hovedknapp>
      </nav>
    </AppLayoutWithContext>
  );
}

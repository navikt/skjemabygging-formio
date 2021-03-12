import React from "react";
import { Link } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import * as PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

import { AppLayoutWithContext } from "../components/AppLayout";
import { SletteKnapp } from "./components";
import { Hovedknapp } from "nav-frontend-knapper";

const FormsList = ({ forms, children, className }) => {
  return (
    <ul className={className}>
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
    gridTemplateColumns: "auto 6rem",
    width: "auto",
    "&:nth-child(odd)": {
      backgroundColor: "#ddd",
    },
  },
});

function FormsListPage({ forms, url, onDelete, onNew, onLogout }) {
  const classes = useFormsListPageStyles();
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Skjemaoversikt",
        visSkjemaliste: false,
        visOversettelseliste: true,
        logout: onLogout,
        onNew: onNew,
      }}
      mainCol={
        <nav className="list-inline">
          <div className="list-inline-item">
            <Hovedknapp onClick={onNew}>Lag nytt skjema</Hovedknapp>
          </div>
        </nav>
      }
    >
      <nav className={classes.root}>
        <Sidetittel className="margin-bottom-default">Velg skjema:</Sidetittel>
        <FormsList className={classes.list} forms={forms}>
          {(form) => (
            <li className={classes.listItem} key={form.path}>
              <Link className="lenke" data-testid="editLink" to={`${url}/${form.path}/edit`}>
                {form.title}
              </Link>
              <SletteKnapp className="lenke" onClick={() => onDelete(form)}>
                Slett skjema
              </SletteKnapp>
            </li>
          )}
        </FormsList>
      </nav>
    </AppLayoutWithContext>
  );
}

export { FormsListPage, FormsList };

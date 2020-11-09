import React from "react";
import { SlettSkjemaKnapp } from "./components";
import { Link } from "react-router-dom";
import { Hovedknapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import * as PropTypes from "prop-types";

const FormsList = ({ forms, children }) => {
  return <ul>{forms.sort((a, b) => (a.modified < b.modified ? 1 : -1)).map((form) => children(form))}</ul>;
};

FormsList.propTypes = {
  sort: PropTypes.any,
  callbackfn: PropTypes.func,
};

export function FormsListPage({ forms, url, onDelete, onNew }) {
  return (
    <AppLayoutWithContext navBarProps={{ title: "Skjemabygger", visSkjemaliste: false }}>
      <nav>
        <h3>Velg skjema:</h3>
        <FormsList forms={forms}>
          {(form) => (
            <li key={form.path}>
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

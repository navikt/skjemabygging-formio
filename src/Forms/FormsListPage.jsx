import { NavBar } from "../components/NavBar";
import { Pagewrapper, SlettSkjemaKnapp } from "./components";
import { Link } from "react-router-dom";
import { Hovedknapp } from "nav-frontend-knapper";
import React from "react";
import {NoScrollWrapper} from "./ActionRow";

export function FormsListPage({ logout, forms, url, onDelete, onNew }) {
  /*const testApi = () => {
    fetch('/api/hey')
      .then(response => response.json())
      .then(json => console.log(json));
  };*/
  return (
    <>
      <NoScrollWrapper>
        <NavBar title={"Skjemabygger"} visSkjemaliste={false} />
      </NoScrollWrapper>
      <Pagewrapper>
        {forms && (
          <nav>
            <h3>Velg skjema:</h3>
            <ul>
              {forms
                .sort((a, b) => (a.modified < b.modified ? 1 : -1))
                .map((form) => (
                  <li key={form.path}>
                    <Link className="lenke" data-testid="editLink" to={`${url}/${form.path}/edit`}>
                      {form.title}
                    </Link>
                    <SlettSkjemaKnapp className="lenke" onClick={() => onDelete(form)}>
                      Slett skjema
                    </SlettSkjemaKnapp>
                  </li>
                ))}
            </ul>
            <Hovedknapp onClick={onNew}>Lag nytt skjema</Hovedknapp>
            {/*<Knapp onClick={testApi}>Bruk api</Knapp>*/}
          </nav>
        )}
      </Pagewrapper>
    </>
  );
}

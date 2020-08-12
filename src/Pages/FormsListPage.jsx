import { MenuItem, MenuLink, NavBar } from "../components/NavBar";
import { Pagewrapper } from "../components/Pagewrapper";
import { Link } from "react-router-dom";
import { Hovedknapp } from "nav-frontend-knapper";
import React from "react";
import {styled} from "@material-ui/styles";

const SlettSkjemaKnapp = styled("button")({
  float: "right",
  outline: "none",
  border: 0,
  padding: 0
});

export function FormsListPage({ logout, forms, url, onDelete, onNew }) {
  /*const testApi = () => {
    fetch('/api/hey')
      .then(response => response.json())
      .then(json => console.log(json));
  };*/
  return (
    <>
      <NavBar title={"Skjemabygger"}>
        <MenuItem>Skjemaer</MenuItem>
        <MenuLink to="/" onClick={logout}>
          Logout
        </MenuLink>
      </NavBar>
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

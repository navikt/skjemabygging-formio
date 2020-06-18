import {MenuItem, MenuLink, NavBar} from "../components/NavBar";
import {Pagewrapper, SlettSkjemaKnapp} from "./components";
import {Link} from "react-router-dom";
import {Hovedknapp} from "nav-frontend-knapper";
import React from "react";

export function FormsListPage({logout, forms, url, onDelete, onNew}) {
  return <>
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
            {forms.map(form => (
              <li key={form.path}>
                <Link className="lenke" data-testid="editLink"
                      to={`${url}/${form.path}/edit`}>{form.title}</Link>
                <SlettSkjemaKnapp className="lenke" onClick={() => onDelete(form)}>
                  Slett skjema
                </SlettSkjemaKnapp>
              </li>
            ))}
          </ul>
          <Hovedknapp onClick={onNew}>Lag nytt skjema</Hovedknapp>
        </nav>
      )}
    </Pagewrapper>
  </>;
}
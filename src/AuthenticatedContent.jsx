import { Link, Route, Switch } from "react-router-dom";
import FormEdit from "./react-formio/FormEdit";
import React from "react";
import { MenuLink, MenuItem, NavBar } from "./NavBar";

export const AuthenticatedContent = ({ forms, onLogout }) => {
  return (
    <Switch>
      <Route
        path={"/forms/:formpath"}
        render={props => {
          const { formpath } = props.match.params;
          if (forms) {
            const form = getFormFromPath(forms, formpath);
            return (
              <>
                <NavBar>
                  <MenuLink to="/forms">Skjemaer</MenuLink>
                  <MenuLink to="/" onClick={onLogout}>
                    Logout
                  </MenuLink>
                </NavBar>
                <>
                  {form && (
                    <FormEdit
                      key={form._id}
                      form={form}
                      options={{
                        src: "http://localhost:3001/" + formpath
                      }}
                      saveForm={() => console.log(form)}
                      saveText="LAGRE"
                    />
                  )}
                </>
              </>
            );
          }
          return <h1>Laster...</h1>;
        }}
      />
      <Route path="/forms">
        <>
          <NavBar>
            <MenuItem>Skjemaer</MenuItem>
            <MenuLink to="/" onClick={onLogout}>
              Logout
            </MenuLink>
          </NavBar>
          {forms && (
            <nav>
              <h3>Velg skjema:</h3>
              <ul>
                {forms.map(form => (
                  <li key={form.path}>
                    <Link to={"/forms/" + form.path}>{form.title}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      </Route>
    </Switch>
  );
};

const getFormFromPath = (forms, path) => forms.find(form => form.path === path);

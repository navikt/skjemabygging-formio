import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import FormEdit from "./react-formio/FormEdit";
import React from "react";
import { MenuLink, MenuItem, NavBar } from "./NavBar";

export const Forms = ({ forms, projectURL, onLogout }) => {
  let { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route
        path={`${path}/:formpath`}
        render={({ match }) => {
          let { params } = match;
          if (forms) {
            const form = getFormFromPath(forms, params.formpath);
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
                        src: `${projectURL}/${params.formpath}`
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
      <Route path={path}>
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
                    <Link to={`${url}/${form.path}`}>{form.title}</Link>
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

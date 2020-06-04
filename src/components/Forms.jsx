import { Link, Route, Switch, useRouteMatch, Redirect } from "react-router-dom";
import NavForm from "../components/NavForm.jsx";
import React from "react";
import { MenuLink, MenuItem, NavBar } from "./NavBar";
import { styled } from "@material-ui/styles";
import NavFormBuilder from "./NavFormBuilder";
import { FormMetadataEditor } from "./FormMetadataEditor";
import { useAuth } from "../context/auth-context";
import { Hovedknapp } from "nav-frontend-knapper";
import NewFormPage from "./NewFormPage";
import "nav-frontend-lenker-style";

const Pagewrapper = styled("div")({
  padding: "2rem"
});

const LinkWrapper = styled("div")({
  padding: "1rem 0",
  float: "right"
});

const SlettSkjemaKnapp = styled("button")({
  float: "right",
  outline: "none",
  border: 0,
  padding: 0

});

export const Forms = ({ forms, onChange, onSave, onNew, onCreate, onDelete }) => {
  let { path, url } = useRouteMatch();
  const { logout } = useAuth();

  return (
    <Switch>
      <Route path={`${path}/new`}>
        <NewFormPage onCreate={onCreate} />
      </Route>
      <Route
        path={`${path}/:formpath/edit`}
        render={({ match }) => {
          let { params } = match;
          if (forms) {
            const form = getFormFromPath(forms, params.formpath);
            return (
              <>
                <NavBar>
                  <MenuLink to="/forms">Skjemaer</MenuLink>
                  <MenuLink to="/" onClick={logout}>
                    Logout
                  </MenuLink>
                </NavBar>
                <Pagewrapper>
                  <>
                    {form && (
                      <>
                        <FormMetadataEditor form={form} onChange={onChange} />
                        <NavFormBuilder form={form} onChange={onChange} />
                      </>
                    )}
                  </>
                  <LinkWrapper>
                    <Link to={`${path}/${params.formpath}/view`}>Test skjema</Link>
                  </LinkWrapper>
                  <LinkWrapper>
                    <button onClick={() => onSave(form)}>Lagre skjema</button>
                  </LinkWrapper>
                </Pagewrapper>
              </>
            );
          }
          return <h1>Laster...</h1>;
        }}
      />
      <Route
        path={`${path}/:formpath/view`}
        render={({ match }) => {
          let { params } = match;
          if (forms) {
            const form = getFormFromPath(forms, params.formpath);
            return (
              <>
                <NavBar>
                  <MenuLink to="/forms">Skjemaer</MenuLink>
                  <MenuLink to="/" onClick={logout}>
                    Logout
                  </MenuLink>
                </NavBar>
                <Pagewrapper>
                  <NavForm form={form} />
                  <LinkWrapper>
                    <Link to={`${path}/${params.formpath}/edit`}>Rediger skjema</Link>
                  </LinkWrapper>
                  <LinkWrapper>
                    <button onClick={() => onSave(form)}>Lagre skjema</button>
                  </LinkWrapper>
                </Pagewrapper>
              </>
            );
          }
          return <h1>Laster...</h1>;
        }}
      />
      <Route path={`${path}/:formpath`}>
        {({ match }) => <Redirect to={`${path}/${match.params.formpath}/edit`} />}
      </Route>
      <Route path={path}>
        <>
          <NavBar>
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
                      <Link className="lenke" data-testid="editLink" to={`${url}/${form.path}/edit`}>{form.title}</Link>
                      <SlettSkjemaKnapp className="lenke" onClick={() => onDelete(form)}> Slett skjema </SlettSkjemaKnapp>
                    </li>
                  ))}
                </ul>
                <Hovedknapp onClick={onNew}>Lag nytt skjema</Hovedknapp>
              </nav>
            )}
          </Pagewrapper>
        </>
      </Route>
    </Switch>
  );
};

const getFormFromPath = (forms, path) => forms.find(form => form.path === path);

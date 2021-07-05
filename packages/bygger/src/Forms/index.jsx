import { Route, Switch, useRouteMatch } from "react-router-dom";
import "nav-frontend-lenker-style";
import React from "react";
import { makeStyles } from "@material-ui/styles";
import { useAuth } from "../context/auth-context";
import NewFormPage from "./NewFormPage";
import { FormsListPage } from "./FormsListPage";
import { FormPage } from "./FormPage";
import { CustomComponents, I18nProvider } from "@navikt/skjemadigitalisering-shared-components";
import Components from "formiojs/components/Components";

const useLoadingStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
    "& h1": {
      fontSize: "3rem",
      fontWeight: "bolder",
    },
  },
});

const LoadingComponent = () => {
  const classes = useLoadingStyles();
  return (
    <div className={classes.root}>
      <h1>Laster...</h1>
    </div>
  );
};
export const FormsRouter = ({ forms, onChange, onSave, onNew, onCreate, onDelete, onPublish, loadTranslations }) => {
  Components.setComponents(CustomComponents);
  let { path, url } = useRouteMatch();
  const { logout } = useAuth();
  if (!forms) {
    return <LoadingComponent />;
  }
  return (
    <Switch>
      <Route path={`${path}/new`}>
        <NewFormPage onCreate={onCreate} onLogout={logout} />
      </Route>
      <Route
        path={`${path}/:formpath`}
        render={({ match }) => {
          const form = getFormFromPath(forms, match.params.formpath);
          return (
            <I18nProvider loadTranslations={() => loadTranslations(form.path)}>
              <FormPage
                {...match.params}
                form={form}
                onChange={onChange}
                onSave={onSave}
                onPublish={onPublish}
                logout={logout}
              />
            </I18nProvider>
          );
        }}
      />
      <Route path={path}>
        <FormsListPage onLogout={logout} forms={forms} url={url} onDelete={onDelete} onNew={onNew} />
      </Route>
    </Switch>
  );
};

const getFormFromPath = (forms, path) => {
  const result = forms.find((form) => form.path === path);
  if (!result) {
    throw Error(`No form at path "${path}"`);
  }
  return result;
};

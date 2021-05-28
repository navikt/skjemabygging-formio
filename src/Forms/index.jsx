import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import "nav-frontend-lenker-style";
import React from "react";
import { makeStyles } from "@material-ui/styles";
import { useAuth } from "../context/auth-context";
import NewFormPage from "./NewFormPage";
import { EditFormPage } from "./EditFormPage";
import { TestFormPage } from "./TestFormPage";
import { FormsListPage } from "./FormsListPage";
import CustomComponents from "../customComponents";
import Components from "formiojs/components/Components";
import I18nProvider from "../context/i18n";

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
        path={`${path}/:formpath/edit`}
        render={({ match }) => {
          let { params } = match;
          const form = getFormFromPath(forms, params.formpath);
          const testFormUrl = `${path}/${params.formpath}/view`;
          return (
            <I18nProvider loadTranslations={() => loadTranslations(form.path)}>
              <EditFormPage
                onLogout={logout}
                form={form}
                testFormUrl={testFormUrl}
                onSave={onSave}
                onChange={onChange}
                onPublish={onPublish}
              />
            </I18nProvider>
          );
        }}
      />
      <Route
        path={`${path}/:formPath/view`}
        render={({ match }) => {
          let {
            params: { formPath },
          } = match;
          const form = getFormFromPath(forms, formPath);
          return (
            <I18nProvider loadTranslations={() => loadTranslations(form.path)}>
              <TestFormPage
                {...match.params}
                onLogout={logout}
                loadTranslations={loadTranslations}
                form={getFormFromPath(forms, formPath)}
                editFormUrl={`${path}/${formPath}/edit`}
                onSave={onSave}
                onPublish={onPublish}
              />
            </I18nProvider>
          );
        }}
      />
      <Route path={`${path}/:formpath`}>
        {({ match }) => <Redirect to={`${path}/${match.params.formpath}/edit`} />}
      </Route>
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

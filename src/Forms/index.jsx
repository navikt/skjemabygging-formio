import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import "nav-frontend-lenker-style";
import React from "react";
import { useAuth } from "../context/auth-context";
import NewFormPage from "./NewFormPage";
import { EditFormPage } from "./EditFormPage";
import { TestFormPage } from "./TestFormPage";
import { FormsListPage } from "./FormsListPage";
import CustomComponents from "../customComponents";
import Components from "formiojs/components/Components";
import LoadingComponent from "../components/LoadingComponent";

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
            <EditFormPage
              onLogout={logout}
              form={form}
              testFormUrl={testFormUrl}
              onSave={onSave}
              onChange={onChange}
              onPublish={onPublish}
            />
          );
        }}
      />
      <Route
        path={`${path}/:formpath/view`}
        render={({ match }) => {
          return (
            <TestFormPage
              {...match.params}
              onLogout={logout}
              loadTranslations={loadTranslations}
              form={getFormFromPath(forms, match.params.formpath)}
              editFormUrl={`${path}/${match.params.formpath}/edit`}
              onSave={onSave}
            />
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

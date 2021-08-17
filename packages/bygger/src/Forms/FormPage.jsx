import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import React from "react";
import { EditFormPage } from "./EditFormPage";
import { TestFormPage } from "./TestFormPage";
import { FormSettingsPage } from "./FormSettingsPage";

export const FormPage = ({ form, onChange, onSave, onPublish, logout }) => {
  let { url } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${url}/edit`}>
        <EditFormPage
          onLogout={logout}
          form={form}
          testFormUrl={`${url}/view`}
          formSettingsUrl={`${url}/settings`}
          onSave={onSave}
          onChange={onChange}
          onPublish={onPublish}
        />
      </Route>
      <Route path={`${url}/view`}>
        <TestFormPage
          onLogout={logout}
          form={form}
          editFormUrl={`${url}/edit`}
          formSettingsUrl={`${url}/settings`}
          onSave={onSave}
          onPublish={onPublish}
        />
      </Route>
      <Route path={`${url}/settings`}>
        <FormSettingsPage
          onLogout={logout}
          form={form}
          editFormUrl={`${url}/edit`}
          testFormUrl={`${url}/view`}
          onSave={onSave}
          onPublish={onPublish}
        />
      </Route>
      <Route path={url}>
        <Redirect to={`${url}/edit`} />
      </Route>
    </Switch>
  );
};

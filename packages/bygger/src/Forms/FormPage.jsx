import React from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import { EditFormPage } from "./EditFormPage";
import { FormSettingsPage } from "./FormSettingsPage";
import { TestFormPage } from "./TestFormPage";

export const FormPage = ({ form, onChange, onSave, onPublish }) => {
  let { url } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${url}/edit`}>
        <EditFormPage
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
          form={form}
          editFormUrl={`${url}/edit`}
          formSettingsUrl={`${url}/settings`}
          onSave={onSave}
          onPublish={onPublish}
        />
      </Route>
      <Route path={`${url}/settings`}>
        <FormSettingsPage
          form={form}
          editFormUrl={`${url}/edit`}
          testFormUrl={`${url}/view`}
          onSave={onSave}
          onChange={onChange}
          onPublish={onPublish}
        />
      </Route>
      <Route path={url}>
        <Redirect to={`${url}/edit`} />
      </Route>
    </Switch>
  );
};

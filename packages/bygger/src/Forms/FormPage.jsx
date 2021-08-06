import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import React from "react";
import { EditFormPage } from "./EditFormPage";
import { TestFormPage } from "./TestFormPage";

export const FormPage = ({ form, onChange, onSave, onPublish, logout }) => {
  let { url } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${url}/edit`}>
        <EditFormPage
          onLogout={logout}
          form={form}
          testFormUrl={`${url}/view`}
          onSave={onSave}
          onChange={onChange}
          onPublish={onPublish}
        />
      </Route>
      <Route path={`${url}/view`}>
        <TestFormPage onLogout={logout} form={form} editFormUrl={`${url}/edit`} onSave={onSave} onPublish={onPublish} />
      </Route>
      <Route path={url}>
        <Redirect to={`${url}/edit`} />
      </Route>
    </Switch>
  );
};

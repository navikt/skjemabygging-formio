import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import "nav-frontend-lenker-style";
import React from "react";
import { useAuth } from "../context/AuthProvider";
//import NewFormPage from "./NewFormPage";
//import { EditFormPage } from "./EditFormPage";
//import { TestFormPage } from "./TestFormPage";
import { FormsListPage } from "./FormsListPage";
//import Custom from "../CustomFields";
//import Components from "formiojs/components/Components";
//
export const FormsRouter = ({ forms, onChange, onSave, onNew, onCreate, onDelete, onPublish}) => {
  //Components.setComponents(Custom);
  let { path, url } = useRouteMatch();
  const { logout } = useAuth();
  if (!forms) {
    return <h1>Laster...</h1>;
  }
  return (
    <Switch>
      <Route path={path}>
        <FormsListPage
          logout={logout}
          forms={forms}
          url={url}
          onDelete={onDelete}
          onNew={onNew}
        />
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

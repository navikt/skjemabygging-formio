import {Redirect, Route, Switch, useRouteMatch} from "react-router-dom";
import "nav-frontend-lenker-style";
import React from "react";
import {useAuth} from "../context/auth-context";
import NewFormPage from "./NewFormPage";
import {EditFormPage} from "./EditFormPage";
import {TestFormPage} from "./TestFormPage";
import {FormsListPage} from "./FormsListPage";

export const FormsRouter = ({forms, onChange, onSave, onNew, onCreate, onDelete}) => {
  let {path, url} = useRouteMatch();
  const {logout} = useAuth();
  if (!forms) {
    return <h1>Laster...</h1>;
  }
  return (
    <Switch>
      <Route path={`${path}/new`}>
        <NewFormPage onCreate={onCreate}/>
      </Route>
      <Route
        path={`${path}/:formpath/edit`}
        render={({match}) => {
          let {params} = match;
          const form = getFormFromPath(forms, params.formpath);
          const testFormUrl = `${path}/${params.formpath}/view`;
          return EditFormPage({logout, form, testFormUrl, onSave, onChange});
        }}
      />
      <Route
        path={`${path}/:formpath/view`}
        render={({match}) => {
          let {params} = match;
          const form = getFormFromPath(forms, params.formpath);
          const editFormUrl = `${path}/${params.formpath}/edit`;
          return TestFormPage({logout, form, editFormUrl, onSave});
        }}
      />
      <Route path={`${path}/:formpath`}>
        {({match}) => <Redirect to={`${path}/${match.params.formpath}/edit`}/>}
      </Route>
      <Route path={path}>
        <FormsListPage logout={logout} forms={forms} url={url} onDelete={onDelete} onNew={onNew}/>
      </Route>
    </Switch>
  );
};

const getFormFromPath = (forms, path) => forms.find(form => form.path === path);

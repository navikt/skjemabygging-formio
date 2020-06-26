import {Redirect, Route, Switch, useRouteMatch} from "react-router-dom";
import "nav-frontend-lenker-style";
import React from "react";
import {useAuth} from "../context/auth-context";
import NewFormPage from "./NewFormPage";
import {EditFormPage} from "./EditFormPage";
import {TestFormPage} from "./TestFormPage";
import {FormsListPage} from "./FormsListPage";
import Custom from '../CustomFields';
import Components from 'formiojs/components/Components';


export const FormsRouter = ({forms, onChange, onSave, onNew, onCreate, onDelete, onPublish}) => {
  Components.setComponents(Custom);
  let {path, url} = useRouteMatch();
  const {logout} = useAuth();
  if (!forms) {
    return <h1>Laster...</h1>;
  }
  return (
    <Switch>
      <Route path={`${path}/new`}>
        <NewFormPage onCreate={onCreate} logout={logout}/>
      </Route>
      <Route
        path={`${path}/:formpath/edit`}
        render={({match}) => {
          let {params} = match;
          const form = getFormFromPath(forms, params.formpath);
          const testFormUrl = `${path}/${params.formpath}/view`;
          return <EditFormPage logout={logout}
                               form={form}
                               testFormUrl={testFormUrl}
                               onSave={onSave}
                               onChange={onChange}
                               onPublish={onPublish}
          />;
        }}
      />
      <Route
        path={`${path}/:formpath/view`}
        render={({match}) => {
          return <TestFormPage
            logout={logout}
            form={getFormFromPath(forms, match.params.formpath)}
            editFormUrl={`${path}/${match.params.formpath}/edit`}
            onSave={onSave}/>;
        }}
      />
      <Route path={`${path}/:formpath`}>
        {({match}) => <Redirect to={`${path}/${match.params.formpath}/edit`}/>}
      </Route>
      <Route path={path}>
        <FormsListPage logout={logout} forms={forms} url={url} onDelete={onDelete} onNew={onNew} />
      </Route>
    </Switch>
  );
};

const getFormFromPath = (forms, path) => {
  const result = forms.find(form => form.path === path);
  if (!result) {
    throw Error(`No form at path "${path}"`);
  }
  return result;
}

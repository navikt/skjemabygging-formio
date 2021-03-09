import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import { FormsRouter } from "./Forms";
import { useForms } from "./useForms";
import { UserAlerterContext } from "./userAlerting";
import NewResource from "./resources/NewResource";
import { ResourceListPage } from "./resources/ResourceListPage";
import EditResourcePage from "./resources/EditResourcePage";

function AuthenticatedApp({ formio, store }) {
  const userAlerter = useContext(UserAlerterContext);
  const { forms, onChangeForm, onSave, onCreate, onDelete, onPublish, loadLanguage, loadLanguages } = useForms(
    formio,
    store,
    userAlerter
  );

  const history = useHistory();
  const wrappedCreate = (newForm) => {
    onCreate(newForm).then((savedForm) => {
      history.push(`/forms/${savedForm.path}/edit`);
    });
  };
  return (
    <>
      <Switch>
        <Route path="/forms">
          <FormsRouter
            forms={forms}
            onChange={onChangeForm}
            onSave={onSave}
            onCreate={wrappedCreate}
            onDelete={onDelete}
            onPublish={onPublish}
            onNew={() => history.push("/forms/new")}
            loadLanguage={loadLanguage}
          />
        </Route>
        <Route path="/resources">
          <ResourceListPage projectURL={formio.projectUrl} loadLanguages={loadLanguages} />
        </Route>
        <Route path="/resource/new">
          <NewResource projectURL={formio.projectUrl} />
        </Route>
        <Route
          path="/resource/:resourceId"
          render={({ match }) => <EditResourcePage {...match.params} projectURL={formio.projectUrl} />}
        />
        <Route path="/">
          <Redirect to="/forms" />
        </Route>
      </Switch>
    </>
  );
}

AuthenticatedApp.propTypes = {
  store: PropTypes.object.isRequired,
  formio: PropTypes.object.isRequired,
};

export default AuthenticatedApp;

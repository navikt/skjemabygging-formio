import { CustomComponents } from "@navikt/skjemadigitalisering-shared-components";
import Components from "formiojs/components/Components";
import "nav-frontend-lenker-style";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { FormPage } from "./FormPage";
import { FormsListPage } from "./FormsListPage";
import NewFormPage from "./NewFormPage";

export const FormsRouter = ({
  deleteForm,
  formio,
  loadForm,
  loadFormsList,
  onSave,
  onNew,
  onPublish,
  loadTranslations,
  onLogout,
}) => {
  Components.setComponents(CustomComponents);
  let { path, url } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/new`}>
        <NewFormPage formio={formio} onLogout={onLogout} />
      </Route>
      <Route path={`${path}/:formPath`}>
        <FormPage
          loadForm={loadForm}
          loadTranslations={loadTranslations}
          onSave={onSave}
          onPublish={onPublish}
          onLogout={onLogout}
        />
      </Route>
      <Route path={path}>
        <FormsListPage
          loadFormsList={loadFormsList}
          onLogout={onLogout}
          url={url}
          deleteForm={deleteForm}
          onNew={onNew}
        />
      </Route>
    </Switch>
  );
};

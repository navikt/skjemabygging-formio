import { CustomComponents } from "@navikt/skjemadigitalisering-shared-components";
import Components from "formiojs/components/Components";
import "nav-frontend-lenker-style";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { FormPage } from "./FormPage";
import { FormsListPage } from "./FormsListPage";
import NewFormPage from "./NewFormPage";

export const FormsRouter = ({
  loadForm,
  loadFormsList,
  onSave,
  onNew,
  onCreate,
  onDelete,
  onPublish,
  loadTranslations,
  onLogout,
}) => {
  Components.setComponents(CustomComponents);
  let { path, url } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/new`}>
        <NewFormPage onCreate={onCreate} onLogout={onLogout} />
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
        <FormsListPage loadFormsList={loadFormsList} onLogout={onLogout} url={url} onDelete={onDelete} onNew={onNew} />
      </Route>
    </Switch>
  );
};

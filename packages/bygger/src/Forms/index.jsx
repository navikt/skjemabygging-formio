import { CustomComponents } from "@navikt/skjemadigitalisering-shared-components";
import Components from "formiojs/components/Components";
import "nav-frontend-lenker-style";
import React, { useContext } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { useFormioForms } from "../hooks/useFormioForms";
import { useFormioTranslations } from "../hooks/useFormioTranslations";
import { UserAlerterContext } from "../userAlerting";
import { FormPage } from "./FormPage";
import { FormsListPage } from "./FormsListPage";
import NewFormPage from "./NewFormPage";

export const FormsRouter = ({ formio, onNew, onLogout, serverURL }) => {
  Components.setComponents(CustomComponents);
  let { path, url } = useRouteMatch();
  const userAlerter = useContext(UserAlerterContext);
  const { deleteForm, loadForm, loadFormsList, onSave, onPublish } = useFormioForms(formio, userAlerter);
  const { loadTranslationsForEditPage } = useFormioTranslations(serverURL, formio, userAlerter);
  return (
    <Switch>
      <Route path={`${path}/new`}>
        <NewFormPage formio={formio} onLogout={onLogout} />
      </Route>
      <Route path={`${path}/:formPath`}>
        <FormPage
          loadForm={loadForm}
          loadTranslations={loadTranslationsForEditPage}
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

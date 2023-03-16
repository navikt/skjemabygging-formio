import { CustomComponents } from "@navikt/skjemadigitalisering-shared-components";
import Components from "formiojs/components/Components";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { useFormioForms } from "../hooks/useFormioForms";
import { useFormioTranslations } from "../hooks/useFormioTranslations";
import { FormPage } from "./FormPage";
import { FormsListPage } from "./FormsListPage";
import NewFormPage from "./NewFormPage";

export const FormsRouter = ({ formio, serverURL }) => {
  Components.setComponents(CustomComponents);
  let { path, url } = useRouteMatch();
  const { loadForm, loadFormsList, onSave, onPublish, onUnpublish } = useFormioForms(formio);
  const { loadTranslationsForEditPage } = useFormioTranslations(serverURL, formio);

  return (
    <Switch>
      <Route path={`${path}/new`}>
        <NewFormPage formio={formio} />
      </Route>
      <Route path={`${path}/:formPath`}>
        <FormPage
          loadForm={loadForm}
          loadTranslations={loadTranslationsForEditPage}
          onSave={onSave}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
        />
      </Route>
      <Route path={path}>
        <FormsListPage loadFormsList={loadFormsList} url={url} />
      </Route>
    </Switch>
  );
};

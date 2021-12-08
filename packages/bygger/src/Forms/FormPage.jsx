import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useEffect, useState } from "react";
import { Redirect, Route, Switch, useParams, useRouteMatch } from "react-router-dom";
import I18nProvider from "../context/i18n";
import { EditFormPage } from "./EditFormPage";
import { FormSettingsPage } from "./FormSettingsPage";
import { TestFormPage } from "./TestFormPage";

export const FormPage = ({ loadForm, loadTranslations, onSave, onPublish }) => {
  let { url } = useRouteMatch();
  const { formPath } = useParams();
  const [status, setStatus] = useState("LOADING");
  const [form, setForm] = useState();

  useEffect(() => {
    loadForm(formPath)
      .then((form) => {
        setForm(form);
        setStatus("FINISHED LOADING");
      })
      .catch((e) => {
        console.log(e);
        setStatus("FORM NOT FOUND");
      });
  }, [loadForm, formPath]);

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  if (status === "FORM NOT FOUND" || !form) {
    return <h1>Vi fant ikke dette skjemaet...</h1>;
  }

  const loadTranslationsForFormPath = () => loadTranslations(form.path);

  return (
    <I18nProvider loadTranslations={loadTranslationsForFormPath} form={form}>
      <Switch>
        <Route path={`${url}/edit`}>
          <EditFormPage
            form={form}
            testFormUrl={`${url}/view`}
            formSettingsUrl={`${url}/settings`}
            onSave={onSave}
            onChange={setForm}
            onPublish={onPublish}
          />
        </Route>
        <Route path={`${url}/view`}>
          <TestFormPage form={form} editFormUrl={`${url}/edit`} formSettingsUrl={`${url}/settings`} />
        </Route>
        <Route path={`${url}/settings`}>
          <FormSettingsPage
            form={form}
            editFormUrl={`${url}/edit`}
            testFormUrl={`${url}/view`}
            onSave={onSave}
            onChange={setForm}
            onPublish={onPublish}
          />
        </Route>
        <Route path={url}>
          <Redirect to={`${url}/edit`} />
        </Route>
      </Switch>
    </I18nProvider>
  );
};

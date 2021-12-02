import React, { useEffect, useState } from "react";
import { Redirect, Route, Switch, useParams, useRouteMatch } from "react-router-dom";
import LoadingComponent from "../components/LoadingComponent";
import I18nProvider from "../context/i18n";
import { EditFormPage } from "./EditFormPage";
import { FormSettingsPage } from "./FormSettingsPage";
import { TestFormPage } from "./TestFormPage";

export const FormPage = ({ loadForm, loadTranslations, onSave, onPublish, onLogout }) => {
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
      });
  }, [loadForm, formPath]);

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  if (!form) {
    return <h1>Vi fant ikke dette skjemaet...</h1>;
  }
  return (
    <I18nProvider loadTranslations={() => loadTranslations(form.path)} form={form}>
      <Switch>
        <Route path={`${url}/edit`}>
          <EditFormPage
            onLogout={onLogout}
            form={form}
            testFormUrl={`${url}/view`}
            formSettingsUrl={`${url}/settings`}
            onSave={onSave}
            onChange={setForm}
            onPublish={onPublish}
          />
        </Route>
        <Route path={`${url}/view`}>
          <TestFormPage
            onLogout={onLogout}
            form={form}
            editFormUrl={`${url}/edit`}
            formSettingsUrl={`${url}/settings`}
            onSave={onSave}
            onPublish={onPublish}
          />
        </Route>
        <Route path={`${url}/settings`}>
          <FormSettingsPage
            onLogout={onLogout}
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

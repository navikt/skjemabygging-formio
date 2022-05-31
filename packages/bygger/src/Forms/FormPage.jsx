import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useCallback, useEffect, useState } from "react";
import { Prompt, Redirect, Route, Switch, useParams, useRouteMatch } from "react-router-dom";
import I18nStateProvider from "../context/i18n/I18nContext";
import { EditFormPage } from "./EditFormPage";
import { FormSettingsPage } from "./FormSettingsPage";
import { TestFormPage } from "./TestFormPage";

export const FormPage = ({ loadForm, loadTranslations, onSave, onPublish }) => {
  let { url } = useRouteMatch();
  const { formPath } = useParams();
  const [status, setStatus] = useState("LOADING");
  const [form, setForm] = useState();
  const [hasUnsavedChanges, setHasUnsavedChanged] = useState(false);

  const loadTranslationsForFormPath = useCallback(() => loadTranslations(form?.path), [loadTranslations, form?.path]);
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

  const onChange = (changedForm) => {
    setHasUnsavedChanged(true);
    setForm(changedForm);
  };

  const saveFormAndResetIsUnsavedChanges = async (form) => {
    const savedForm = await onSave(form);
    if (!savedForm.error) {
      setHasUnsavedChanged(false);
      setForm(savedForm);
      return savedForm;
    }
    return form;
  };

  const publishForm = async (form, translations) => {
    const publishedForm = await onPublish(form, translations);
    setForm(publishedForm);
  };

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  if (status === "FORM NOT FOUND" || !form) {
    return <h1>Vi fant ikke dette skjemaet...</h1>;
  }

  const onLeaveMessage =
    "Hvis du går vekk fra denne siden uten å lagre, så mister du alle endringene." +
    "Er du sikker på at du vil gå videre?";

  return (
    <I18nStateProvider loadTranslations={loadTranslationsForFormPath} form={form}>
      <Switch>
        <Route path={`${url}/edit`}>
          <Prompt
            when={hasUnsavedChanges}
            message={(location) => (location.pathname.startsWith(url) ? true : onLeaveMessage)}
          />
          <EditFormPage
            form={form}
            testFormUrl={`${url}/view/skjema`}
            formSettingsUrl={`${url}/settings`}
            onSave={saveFormAndResetIsUnsavedChanges}
            onChange={onChange}
            onPublish={publishForm}
          />
        </Route>
        <Route path={`${url}/view`}>
          <TestFormPage form={form} editFormUrl={`${url}/edit`} formSettingsUrl={`${url}/settings`} />
        </Route>
        <Route path={`${url}/settings`}>
          <FormSettingsPage
            form={form}
            editFormUrl={`${url}/edit`}
            testFormUrl={`${url}/view/skjema`}
            onSave={saveFormAndResetIsUnsavedChanges}
            onChange={onChange}
            onPublish={publishForm}
          />
        </Route>
        <Route path={url}>
          <Redirect to={`${url}/edit`} />
        </Route>
      </Switch>
    </I18nStateProvider>
  );
};

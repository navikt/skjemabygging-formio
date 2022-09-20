import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useCallback, useEffect, useState } from "react";
import { Prompt, Redirect, Route, Switch, useParams, useRouteMatch } from "react-router-dom";
import I18nStateProvider from "../context/i18n/I18nContext";
import { EditFormPage } from "./EditFormPage";
import { FormSettingsPage } from "./FormSettingsPage";
import { TestFormPage } from "./TestFormPage";

export const FormPage = ({ loadForm, loadTranslations, onSave, onPublish, onUnpublish }) => {
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
    if (formHasChanged(form, changedForm)) {
      setHasUnsavedChanged(true);
    }
    setForm(changedForm);
  };

  const formHasChanged = (form, changedForm) => {
    return JSON.stringify(removeIds(form)) !== JSON.stringify(removeIds(changedForm));
  };

  const removeIds = (object) => {
    const clonedObject = {
      ...object,
    };

    if (clonedObject.id) {
      delete clonedObject.id;
    }

    if (clonedObject.components && clonedObject.components.length > 0) {
      clonedObject.components = clonedObject.components.map((component) => removeIds(component));
    }

    return clonedObject;
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

  const unpublishForm = async (form) => {
    const unpublishForm = await onUnpublish(form);
    setForm(unpublishForm);
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
      <Prompt
        when={hasUnsavedChanges}
        message={(location) => (location.pathname.startsWith(url) ? true : onLeaveMessage)}
      />
      <Switch>
        <Route path={`${url}/edit`}>
          <EditFormPage
            form={form}
            onSave={saveFormAndResetIsUnsavedChanges}
            onChange={onChange}
            onPublish={publishForm}
            onUnpublish={unpublishForm}
          />
        </Route>
        <Route path={`${url}/view`}>
          <TestFormPage form={form} />
        </Route>
        <Route path={`${url}/settings`}>
          <FormSettingsPage
            form={form}
            onSave={saveFormAndResetIsUnsavedChanges}
            onChange={onChange}
            onPublish={publishForm}
            onUnpublish={unpublishForm}
          />
        </Route>
        <Route path={url}>
          <Redirect to={`${url}/edit`} />
        </Route>
      </Switch>
    </I18nStateProvider>
  );
};

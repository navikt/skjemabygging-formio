import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { Prompt, Redirect, Route, Switch, useParams, useRouteMatch } from "react-router-dom";
import I18nStateProvider from "../context/i18n/I18nContext";
import { EditFormPage } from "./EditFormPage";
import formPageReducer from "./formPageReducer";
import { FormSettingsPage } from "./FormSettingsPage";
import { TestFormPage } from "./TestFormPage";

export const FormPage = ({ loadForm, loadTranslations, onSave, onPublish, onUnpublish }) => {
  let { url } = useRouteMatch();
  const { formPath } = useParams();
  const [, setFormDiff] = useState(null);
  const [state, dispatch] = useReducer(
    formPageReducer,
    { status: "LOADING", hasUnsavedChanges: false },
    (state) => state
  );
  const loadTranslationsForFormPath = useCallback(
    () => loadTranslations(state.form?.path),
    [loadTranslations, state.form?.path]
  );

  useEffect(() => {
    loadForm(formPath)
      .then((form) => {
        dispatch({ type: "form-loaded", form });
      })
      .catch((e) => {
        console.log(e);
        dispatch({ type: "form-not-found" });
      });
  }, [loadForm, formPath]);

  useEffect(() => {
    async function loadDiff() {
      const response = await fetch(`/api/form/${formPath}/diff`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      const diff = await response.json();
      console.log("Form diff", diff);
      return diff;
    }
    loadDiff().then(setFormDiff);
  }, [formPath, setFormDiff]);

  const onChange = (changedForm) => {
    dispatch({ type: "form-changed", form: changedForm });
  };

  const saveFormAndResetIsUnsavedChanges = async (form) => {
    const savedForm = await onSave(form);
    if (!savedForm.error) {
      dispatch({ type: "form-saved", form: savedForm });
      return savedForm;
    }
    return form;
  };

  const publishForm = async (form, translations) => {
    const publishedForm = await onPublish(form, translations);
    dispatch({ type: "form-saved", form: publishedForm });
  };

  const unpublishForm = async (form) => {
    const unpublishForm = await onUnpublish(form);
    dispatch({ type: "form-saved", form: unpublishForm });
  };

  if (state.status === "LOADING") {
    return <LoadingComponent />;
  }

  if (state.status === "FORM NOT FOUND" || !state.form) {
    return <h1>Vi fant ikke dette skjemaet...</h1>;
  }

  const onLeaveMessage =
    "Hvis du går vekk fra denne siden uten å lagre, så mister du alle endringene." +
    "Er du sikker på at du vil gå videre?";

  return (
    <I18nStateProvider loadTranslations={loadTranslationsForFormPath} form={state.form}>
      <Prompt
        when={state.hasUnsavedChanges}
        message={(location) => (location.pathname.startsWith(url) ? true : onLeaveMessage)}
      />
      <Switch>
        <Route path={`${url}/edit`}>
          <EditFormPage
            form={state.form}
            onSave={saveFormAndResetIsUnsavedChanges}
            onChange={onChange}
            onPublish={publishForm}
            onUnpublish={unpublishForm}
          />
        </Route>
        <Route path={`${url}/view`}>
          <TestFormPage form={state.form} />
        </Route>
        <Route path={`${url}/settings`}>
          <FormSettingsPage
            form={state.form}
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

import { LoadingComponent, useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React, { useCallback, useEffect, useReducer } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import I18nStateProvider from "../context/i18n/I18nContext";
import { loadPublishedForm } from "./diffing/publishedForm";
import { EditFormPage } from "./EditFormPage";
import formPageReducer from "./formPageReducer";
import { FormSettingsPage } from "./FormSettingsPage";
import { TestFormPage } from "./TestFormPage";

export const FormPage = ({ loadForm, loadTranslations, onSave, onPublish, onUnpublish }) => {
  const { featureToggles, diffOn } = useAppConfig();
  const { formPath } = useParams();
  const [state, dispatch] = useReducer(
    formPageReducer,
    { status: "LOADING", hasUnsavedChanges: false },
    (state) => state,
  );
  const loadTranslationsForFormPath = useCallback(
    () => loadTranslations(state.form?.path),
    [loadTranslations, state.form?.path],
  );

  useEffect(() => {
    loadForm(formPath)
      .then((form) => {
        if (featureToggles.enableDiff) {
          loadPublishedForm(formPath)
            .then((publishedForm) => dispatch({ type: "form-loaded", form, publishedForm }))
            .catch(() => {
              console.debug("Failed to load published form");
              dispatch({ type: "form-loaded", form });
            });
        } else {
          dispatch({ type: "form-loaded", form });
        }
      })
      .catch((e) => {
        console.log(e);
        dispatch({ type: "form-not-found" });
      });
  }, [loadForm, formPath, featureToggles.enableDiff]);

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
    const savedForm = await onPublish(form, translations);
    await loadPublishedForm(formPath)
      .then((publishedForm) => dispatch({ type: "form-saved", form: savedForm, publishedForm }))
      .catch(() => {
        console.debug("Publish completed: Failed to load published form");
        dispatch({ type: "form-saved", form: savedForm });
      });
  };

  const unpublishForm = async (form) => {
    const savedForm = await onUnpublish(form);
    await loadPublishedForm(formPath)
      .then((publishedForm) => dispatch({ type: "form-saved", form: savedForm, publishedForm }))
      .catch(() => {
        console.debug("Unpublish completed: Failed to load published form");
        dispatch({ type: "form-saved", form: savedForm });
      });
  };

  if (state.status === "LOADING") {
    return <LoadingComponent />;
  }

  if (state.status === "FORM NOT FOUND" || !state.form) {
    return <h1>Vi fant ikke dette skjemaet...</h1>;
  }

  /*
  TODO: Add popup
  const onLeaveMessage =
    "Hvis du går vekk fra denne siden uten å lagre, så mister du alle endringene." +
    "Er du sikker på at du vil gå videre?";

   */

  return (
    <I18nStateProvider loadTranslations={loadTranslationsForFormPath} form={state.form}>
      <Routes>
        <Route
          path={"/edit"}
          element={
            <EditFormPage
              form={state.form}
              publishedForm={diffOn ? state.publishedForm : undefined}
              onSave={saveFormAndResetIsUnsavedChanges}
              onChange={onChange}
              onPublish={publishForm}
              onUnpublish={unpublishForm}
            />
          }
        />
        <Route path={"/view/*"} element={<TestFormPage form={state.form} />} />
        <Route
          path={"/settings"}
          element={
            <FormSettingsPage
              form={state.form}
              publishedForm={diffOn ? state.publishedForm : undefined}
              onSave={saveFormAndResetIsUnsavedChanges}
              onChange={onChange}
              onPublish={publishForm}
              onUnpublish={unpublishForm}
            />
          }
        />
        <Route path="/" element={<Navigate to={"edit"} replace />} />
      </Routes>
    </I18nStateProvider>
  );
};

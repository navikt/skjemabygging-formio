import Formiojs from "formiojs/Formio";
import { useCallback } from "react";

export const useFormioForms = (formio, userAlerter) => {
  const loadFormsList = useCallback(() => {
    return formio.loadForms({
      params: {
        type: "form",
        tags: "nav-skjema",
        limit: 1000,
        select: "title, path, tags, properties, modified, _id",
      },
    });
  }, [formio]);

  const loadForm = useCallback(
    (formPath) => {
      return formio
        .loadForms({
          params: {
            type: "form",
            tags: "nav-skjema",
            path: formPath,
            limit: 1,
          },
        })
        .then((forms) => forms[0]);
    },
    [formio]
  );

  const onSave = useCallback(
    (callbackForm) => {
      formio.saveForm({ ...callbackForm, display: "wizard" }).then((form) => {
        userAlerter.flashSuccessMessage("Lagret skjema " + form.title);
        return form;
      });
    },
    [formio, userAlerter]
  );

  const deleteForm = useCallback(
    async (formId, tags, title) => {
      formio.saveForm({ _id: formId, tags: tags.filter((each) => each !== "nav-skjema") }).then(() => {
        userAlerter.flashSuccessMessage("Slettet skjemaet " + title);
      });
    },
    [formio, userAlerter]
  );

  const onPublish = useCallback(
    async (form, translations) => {
      const payload = JSON.stringify({
        form: form,
        translations: translations,
        token: Formiojs.getToken(),
      });
      const response = await fetch(`/api/publish/${form.path}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: payload,
      });
      if (response.ok) {
        userAlerter.flashSuccessMessage("Satt i gang publisering, dette kan ta noen minutter.");
      } else {
        userAlerter.setErrorMessage("Publisering feilet " + response.status);
        console.error("Publisering feilet " + response.status);
      }
    },
    [userAlerter]
  );

  return {
    deleteForm,
    loadForm,
    loadFormsList,
    onSave,
    onPublish,
  };
};

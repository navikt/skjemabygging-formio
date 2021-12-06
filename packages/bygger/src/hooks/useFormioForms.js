import Formiojs from "formiojs/Formio";
import cloneDeep from "lodash.clonedeep";
import { useEffect, useState } from "react";

export const useFormioForms = (formio, userAlerter) => {
  /* useEffect(() => {
    if (forms === null) {
      formio.loadForms({ params: { type: "form", tags: "nav-skjema", limit: 1000 } }).then(setForms);
    }
  }, [forms, setForms, formio]); */

  const loadFormsList = () => {
    return formio.loadForms({
      params: {
        type: "form",
        tags: "nav-skjema",
        limit: 1000,
        select: "title, path, tags, properties, modified, _id",
      },
    });
  };

  const loadForm = (formPath) => {
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
  };

  const onSave = (callbackForm) => {
    formio.saveForm({ ...callbackForm, display: "wizard" }).then((form) => {
      userAlerter.flashSuccessMessage("Lagret skjema " + form.title);
      return form;
    });
  };

  const deleteForm = async (formId, tags, title) => {
    formio.saveForm({ _id: formId, tags: tags.filter((each) => each !== "nav-skjema") }).then(() => {
      userAlerter.flashSuccessMessage("Slettet skjemaet " + title);
    });
  };
  const onPublish = async (form, translations) => {
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
  };
  return {
    deleteForm,
    loadForm,
    loadFormsList,
    onSave,
    onPublish,
  };
};

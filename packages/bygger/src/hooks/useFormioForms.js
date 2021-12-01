import Formiojs from "formiojs/Formio";
import cloneDeep from "lodash.clonedeep";
import { useState } from "react";

export const useFormioForms = (formio, userAlerter) => {
  const [forms, setForms] = useState(null);

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

  const onChangeForm = (form) => {
    setForms([...forms.filter((each) => each.path !== form.path), form]);
  };

  const onSave = (callbackForm) => {
    formio.saveForm(callbackForm).then((form) => {
      userAlerter.flashSuccessMessage("Lagret skjema " + form.title);
      onChangeForm(form);
    });
  };

  const onDelete = (form) => {
    const update = cloneDeep(form);
    update.tags = update.tags.filter((each) => each !== "nav-skjema");
    formio.saveForm(update).then(() => {
      userAlerter.flashSuccessMessage("Slettet skjemaet " + form.title);
      setForms(forms.filter((each) => each._id !== form._id));
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
    forms,
    loadForm,
    loadFormsList,
    onSave,
    onDelete,
    onPublish,
  };
};

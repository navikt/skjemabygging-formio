import { useCallback, useEffect, useState } from "react";
import cloneDeep from "lodash.clonedeep";
import Formiojs from "formiojs/Formio";

export const useForms = (formio, store, flashSuccessMessage) => {
  const [forms, setFormsInternal] = useState(store.forms);
  const setForms = useCallback(
    (forms) => {
      setFormsInternal(forms);
      store.forms = forms;
    },
    [setFormsInternal, store.forms]
  );

  useEffect(() => {
    if (forms === null) {
      formio.loadForms({ params: { type: "form", tags: "nav-skjema" } }).then((forms) => setForms(forms));
    }
  }, [forms, setForms, formio]);

  const onChangeForm = (form) => {
    setForms([...forms.filter((each) => each.path !== form.path), form]);
  };

  const onSave = (callbackForm) => {
    formio.saveForm(callbackForm).then((form) => {
      flashSuccessMessage("Lagret skjema " + form.title);
      onChangeForm(form);
    });
  };

  const onCreate = (form) => {
    return formio.saveForm(form).then((form) => {
      flashSuccessMessage("Opprettet skjemaet " + form.title);
      setForms(forms.concat([form]));
      return form;
    });
  };

  const onDelete = (form) => {
    const update = cloneDeep(form);
    update.tags = update.tags.filter((each) => each !== "nav-skjema");
    formio.saveForm(update).then(() => {
      flashSuccessMessage("Slettet skjemaet " + form.title);
      setForms(forms.filter((each) => each !== form));
    });
  };
  const onPublish = (form) => {
    const payload = JSON.stringify({ form: form, token: Formiojs.getToken() });
    console.log("payload ", payload);
    fetch(`/api/publish/${form.path}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((response) => response.json())
      .then(console.log)
      .catch(() => console.log("Noe gikk galt"));
  };
  return { forms, onChangeForm, onSave, onCreate, onDelete, onPublish };
};

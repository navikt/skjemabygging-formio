import {useCallback, useEffect, useState} from "react";
import cloneDeep from "lodash.clonedeep";

export const useForms = (formio, store) => {
  const [forms, setFormsInternal] = useState(store.forms);
  const setForms = useCallback((forms) => {
    setFormsInternal(forms);
    store.forms = forms;
  }, [setFormsInternal, store.forms]);

  useEffect(() => {
    if (forms.length === 0) {
      formio.loadForms({params: {type: "form", tags: "nav-skjema"}}).then(forms => setForms(forms));
    }
  }, [forms, setForms, formio]);

  const onChangeForm = form => {
    setForms([...forms.filter(each => each.path !== form.path), form]);
  };

  const onSave = callbackForm => {
    formio.saveForm(callbackForm).then(form => {
      onChangeForm(form);
    });
  };

  const onCreate = form => {
    return formio.saveForm(form)
      .then(form => {
        setForms(forms.concat([form]));
        return form;
      })
  };

  const onDelete = form => {
    const update = cloneDeep(form);
    update.tags = update.tags.filter(each => each !== "nav-skjema");
    formio.saveForm(update)
      .then(() => {
        setForms(forms.filter(each => each !== form));
      });
  };

  return {forms, onChangeForm, onSave, onCreate, onDelete};
};
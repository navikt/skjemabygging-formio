import {useCallback, useEffect, useState} from "react";


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
      .catch(error => {
        console.log(error);
        throw error;
      });
  };

  return {forms, onChangeForm, onSave, onCreate};
};
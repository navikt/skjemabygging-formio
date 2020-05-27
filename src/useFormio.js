import {useCallback, useEffect, useMemo, useState} from "react";
import Formiojs from "formiojs/Formio";


export const useFormio = (projectURL, store) => {
  const [forms, setFormsInternal] = useState(store.forms);
  const setForms = useCallback((forms) => {
    setFormsInternal(forms);
    store.forms = forms;
  }, [setFormsInternal, store.forms]);
  const [authenticated, setAuthenticated] = useState(false);
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);

  useEffect(() => {
    if (Formiojs.getUser() && !authenticated) {
      setAuthenticated(true);
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated && forms.length === 0) {
      formio.loadForms({params: {type: "form", tags: "nav-skjema"}}).then(forms => setForms(forms));
    }
  }, [authenticated, forms, setForms, formio]);

  const logOut = () => {
    setAuthenticated(false);
    Formiojs.logout();
  };

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
  }

  return {forms, authenticated, setAuthenticated, logOut, onChangeForm, onSave, onCreate};
};
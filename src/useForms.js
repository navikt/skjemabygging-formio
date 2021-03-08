import { useCallback, useEffect, useState } from "react";
import cloneDeep from "lodash.clonedeep";
import Formiojs from "formiojs/Formio";
import FormioDefaultTranslations from "formiojs/i18n";
import GlobalTranslations from "./i18nData";

export const useForms = (formio, store, userAlerter) => {
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
      formio.loadForms({ params: { type: "form", tags: "nav-skjema", limit: 1000 } }).then(setForms);
    }
  }, [forms, setForms, formio]);

  const onChangeForm = (form) => {
    setForms([...forms.filter((each) => each.path !== form.path), form]);
  };

  const onSave = (callbackForm) => {
    formio.saveForm(callbackForm).then((form) => {
      userAlerter.flashSuccessMessage("Lagret skjema " + form.title);
      onChangeForm(form);
    });
  };

  const onCreate = (form) => {
    return formio.saveForm(form).then((form) => {
      userAlerter.flashSuccessMessage("Opprettet skjemaet " + form.title);
      setForms(forms.concat([form]));
      return form;
    });
  };

  const onDelete = (form) => {
    const update = cloneDeep(form);
    update.tags = update.tags.filter((each) => each !== "nav-skjema");
    formio.saveForm(update).then(() => {
      userAlerter.flashSuccessMessage("Slettet skjemaet " + form.title);
      setForms(forms.filter((each) => each !== form));
    });
  };
  const onPublish = async (form) => {
    const payload = JSON.stringify({ form: form, token: Formiojs.getToken() });
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

  const loadLanguage = async (languageCode) => {
    return Formiojs.fetch(`${formio.projectUrl}/language/submission?data.language=${languageCode}`, {
      headers: {
        "x-jwt-token": Formiojs.getToken(),
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("Response: ", response);
        return response;
      })
      .then((response) =>
        response.reduce(
          (acc, curr) => ({
            ...acc,
            ...{
              resources: {
                ...acc.resources,
                [curr.data.language]: {
                  ...((acc.resources && acc.resources[curr.data.language]) || {}),
                  translation: {
                    ...((acc.resources &&
                      acc.resources[curr.data.language] &&
                      acc.resources[curr.data.language].translation) ||
                      {}),
                    ...curr.data.i18n,
                  },
                },
              },
            },
          }),
          {
            ...FormioDefaultTranslations,
            resources: {
              ...FormioDefaultTranslations.resources,
              ...Object.keys(GlobalTranslations).reduce(
                (languages, language) => ({
                  ...languages,
                  [language]: {
                    ...((FormioDefaultTranslations.resources && FormioDefaultTranslations.resources[language]) || {}),
                    translation: {
                      ...((FormioDefaultTranslations.resources &&
                        FormioDefaultTranslations.resources[language] &&
                        FormioDefaultTranslations.resources[language].translation) ||
                        {}),
                      ...GlobalTranslations[language],
                    },
                  },
                }),
                {}
              ),
            },
          }
        )
      );
  };
  return { forms, onChangeForm, onSave, onCreate, onDelete, onPublish, loadLanguage };
};

import { useCallback, useEffect, useState } from "react";
import cloneDeep from "lodash.clonedeep";
import Formiojs from "formiojs/Formio";
import { combineTranslationResources } from "@navikt/skjemadigitalisering-shared-components";

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
      setForms(forms.filter((each) => each._id !== form._id));
    });
  };
  const onPublish = async (form, translations) => {
    /*    const payload = JSON.stringify({
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
    }*/
    console.warn("Publisering er for øyeblikket ikke tilgjengelig");
  };

  const fetchTranslations = (url) => {
    return fetch(url, {
      headers: {
        "x-jwt-token": Formiojs.getToken(),
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("Response: ", response);
        return response;
      });
  };

  const loadGlobalTranslations = async (language, tag) => {
    let filter = "";
    if (language) {
      filter += `&data.language=${language}`;
    }
    if (tag) {
      filter += `&data.tag=${tag}`;
    }
    return fetchTranslations(`${formio.projectUrl}/language/submission?data.name=global${filter}&limit=null`)
      .then((response) => {
        console.log("Fetched: ", response);
        return response;
      })
      .then((response) => {
        return response.reduce((globalTranslations, translation) => {
          const { data, _id: id } = translation;
          const { i18n, scope, name } = data;
          return {
            ...globalTranslations,
            [data.language]: {
              id,
              name,
              scope,
              translations: Object.keys(i18n).reduce(
                (translationsObjects, translatedText) => ({
                  ...translationsObjects,
                  [translatedText]: {
                    value: i18n[translatedText],
                    scope,
                  },
                }),
                {}
              ),
            },
          };
        }, []);
      })
      .then((globalTranslations) => {
        console.log("Fetched global translations", globalTranslations);
        return globalTranslations;
      });
  };

  const loadTranslationsForForm = async (formPath) => {
    console.log("Form path", formPath);
    return fetchTranslations(
      `${formio.projectUrl}/language/submission?data.name__regex=/^global(.${formPath})*$/gi&limit=null`
    )
      .then((response) => {
        console.log("Fetched", response);
        return response;
      })
      .then((translations) => {
        const languagesWithLocalTranslation = translations.reduce((localTranslations, translation) => {
          if (localTranslations.indexOf(translation.data.language) === -1) {
            return [...localTranslations, translation.data.language];
          } else {
            return localTranslations;
          }
        }, []);
        return translations.filter(
          (translation) => languagesWithLocalTranslation.indexOf(translation.data.language) !== -1
        );
      })
      .then((translations) => {
        console.log("Fetched and filtered", translations);
        return translations;
      });
  };

  const loadTranslationsForEditPage = async (formPath) => {
    return loadTranslationsForForm(formPath)
      .then((translations) =>
        translations
          .map((translation) => ({
            ...translation.data,
            id: translation._id,
          }))
          .reduce(combineTranslationResources, {})
      )
      .then((translations) => {
        console.log("loadTranslationsForEditPage", translations);
        return translations;
      });
  };

  const deleteTranslation = async (id) => {
    return Formiojs.fetch(`${formio.projectUrl}/language/submission/${id}`, {
      headers: {
        "x-jwt-token": Formiojs.getToken(),
      },
      method: "DELETE",
    }).then((response) => {
      console.log("Deleted", id);
      return response;
    });
  };

  const saveTranslation = (projectUrl, translationId, language, i18n, name, scope, form, tag, formTitle) => {
    Formiojs.fetch(`${projectUrl}/language/submission${translationId ? `/${translationId}` : ""}`, {
      headers: {
        "x-jwt-token": Formiojs.getToken(),
        "content-type": "application/json",
      },
      method: translationId ? "PUT" : "POST",
      body: JSON.stringify({
        data: {
          form,
          name,
          language,
          scope,
          i18n,
          tag,
        },
      }),
    }).then((response) => {
      if (response.ok) {
        userAlerter.flashSuccessMessage(
          !formTitle ? "Lagret globale oversettelser" : "Lagret oversettelser for skjema: " + formTitle
        );
      } else {
        response.json().then((r) => {
          const errorMessage = "Lagret oversettelser feilet: ";
          userAlerter.setErrorMessage(errorMessage.concat(r && r.details[0] && r.details[0].message));
        });
      }
    });
  };

  const saveLocalTranslation = (projectUrl, translationId, languageCode, translations, formPath, formTitle) => {
    const i18n = Object.keys(translations).reduce((translationsToSave, translatedText) => {
      if (translations[translatedText].scope === "local" && translations[translatedText].value) {
        return {
          ...translationsToSave,
          [translatedText]: translations[translatedText].value,
        };
      } else {
        return translationsToSave;
      }
    }, {});
    saveTranslation(
      projectUrl,
      translationId,
      languageCode,
      i18n,
      `global.${formPath}`,
      "local",
      formPath,
      undefined,
      formTitle
    );
  };
  const saveGlobalTranslation = (projectUrl, translationId, languageCode, translations, tag) => {
    const i18n = Object.keys(translations).reduce((translationsToSave, translatedText) => {
      if (translations[translatedText].value) {
        return {
          ...translationsToSave,
          [translatedText]: translations[translatedText].value,
        };
      } else {
        return translationsToSave;
      }
    }, {});
    saveTranslation(projectUrl, translationId, languageCode, i18n, "global", "global", undefined, tag);
  };

  return {
    forms,
    onChangeForm,
    onSave,
    onCreate,
    onDelete,
    onPublish,
    loadGlobalTranslations,
    loadTranslationsForEditPage,
    deleteTranslation,
    saveLocalTranslation,
    saveGlobalTranslation,
  };
};

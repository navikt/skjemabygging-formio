import { getIso8601String } from "@navikt/skjemadigitalisering-shared-components";
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
    (callbackForm, silent = false, modified = undefined) => {
      if (!modified) {
        modified = getIso8601String();
      }
      return formio
        .saveForm({ ...updateModified(callbackForm, modified), display: "wizard" })
        .then((form) => {
          if (!silent) {
            userAlerter.flashSuccessMessage("Lagret skjema " + form.title);
          }
          return form;
        })
        .catch((e) => {
          userAlerter.setErrorMessage(
            "Kunne ikke lagre skjemadefinsjonen. Pass på at du er innlogget og at skjemaet ikke innholder flere store bilder."
          );
          return { error: true };
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
      const previousPublished = form.properties?.published;
      const previousModified = form.properties?.modified;
      const now = getIso8601String();
      const formWithPublishedTrue = updatePublished(form, now);
      const result = await onSave(formWithPublishedTrue, true, now);
      if (!result.error) {
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

        if (response?.ok) {
          const success = "Satt i gang publisering, dette kan ta noen minutter.";
          const warning =
            "Publiseringen inneholdt ingen endringer og ble avsluttet (nytt bygg av Fyllut ble ikke trigget)";

          const { changed } = await response.json();
          changed ? userAlerter.flashSuccessMessage(success) : userAlerter.setWarningMessage(warning);
          return result;
        } else {
          userAlerter.setErrorMessage("Publisering feilet " + response?.status);
          return await onSave(updatePublished(form, previousPublished), true, previousModified);
        }
      }
    },
    [userAlerter, onSave]
  );

  const updatePublished = (form, published) => {
    if (!published) return form;

    return {
      ...form,
      properties: {
        ...form.properties,
        published: published,
      },
    };
  };

  /**
   * Formio sets a modified date, but we set our own modified in properties,
   * so we can compare it against the published value.
   */
  const updateModified = (form, modified) => {
    if (!modified) return form;

    return {
      ...form,
      properties: {
        ...form.properties,
        modified: modified,
      },
    };
  };

  return {
    deleteForm,
    loadForm,
    loadFormsList,
    onSave,
    onPublish,
  };
};

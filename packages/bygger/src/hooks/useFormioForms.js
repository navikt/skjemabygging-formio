import { dateUtils } from "@navikt/skjemadigitalisering-shared-domain";
import Formiojs from "formiojs/Formio";
import { useCallback } from "react";
import { useAuth } from "../context/auth-context";

const { getIso8601String } = dateUtils;

export const useFormioForms = (formio, userAlerter) => {
  const { userData } = useAuth();

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
      return formio
        .saveForm({
          ...callbackForm,
          display: "wizard",
          properties: {
            ...callbackForm.properties,
            modified: getIso8601String(),
            modifiedBy: userData.name,
          },
        })
        .then((form) => {
          userAlerter.flashSuccessMessage("Lagret skjema " + form.title);
          return form;
        })
        .catch(() => {
          userAlerter.setErrorMessage(
            "Kunne ikke lagre skjemadefinsjonen. Pass på at du er innlogget og at skjemaet ikke innholder flere store bilder."
          );
          return { error: true };
        });
    },
    [formio, userAlerter, userData]
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
      const payload = JSON.stringify({ form, translations });
      const response = await fetch(`/api/published-forms/${form.path}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "Bygger-Formio-Token": Formiojs.getToken(),
        },
        body: payload,
      });

      if (response?.ok) {
        const success = "Satt i gang publisering, dette kan ta noen minutter.";
        const warning =
          "Publiseringen inneholdt ingen endringer og ble avsluttet (nytt bygg av Fyllut ble ikke trigget)";

        const { changed, form } = await response.json();
        changed ? userAlerter.flashSuccessMessage(success) : userAlerter.setWarningMessage(warning);
        return form;
      } else {
        const { message } = await response.json();
        userAlerter.setErrorMessage(message);
        return await loadForm(form.path);
      }
    },
    [userAlerter, loadForm]
  );

  const onUnpublish = useCallback(
    async (form) => {
      const response = await fetch(`/api/published-forms/${form.path}`, {
        method: "DELETE",
        headers: { "Bygger-Formio-Token": Formiojs.getToken() },
      });
      if (response.ok) {
        const { form } = await response.json();
        userAlerter.flashSuccessMessage("Satt i gang avpublisering, dette kan ta noen minutter.");
        return form;
      } else {
        const { message } = await response.json();
        userAlerter.setErrorMessage(message);
        return await loadForm(form.path);
      }
    },
    [userAlerter, loadForm]
  );

  return {
    deleteForm,
    loadForm,
    loadFormsList,
    onSave,
    onPublish,
    onUnpublish,
  };
};

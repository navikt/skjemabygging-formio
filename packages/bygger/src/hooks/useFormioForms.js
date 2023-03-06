import { dateUtils, navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import Formiojs from "formiojs/Formio";
import { useCallback } from "react";
import { useAuth } from "../context/auth-context";
import { useFeedBackEmit } from "../context/notifications/feedbackContext";

const { getIso8601String } = dateUtils;

export const useFormioForms = (formio) => {
  const feedbackEmit = useFeedBackEmit();
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
          components: navFormUtils.enrichComponentsWithNavIds(callbackForm.components),
          properties: {
            ...callbackForm.properties,
            modified: getIso8601String(),
            modifiedBy: userData.name,
          },
        })
        .then((form) => {
          feedbackEmit.success(`Lagret skjema ${form.title}`);
          return form;
        })
        .catch(() => {
          feedbackEmit.error(
            "Kunne ikke lagre skjemadefinsjonen. Pass på at du er innlogget og at skjemaet ikke innholder flere store bilder."
          );
          return { error: true };
        });
    },
    [formio, userData, feedbackEmit]
  );

  const deleteForm = useCallback(
    async (formId, tags, title) => {
      formio.saveForm({ _id: formId, tags: tags.filter((each) => each !== "nav-skjema") }).then(() => {
        feedbackEmit.success("Slettet skjemaet " + title);
      });
    },
    [formio, feedbackEmit]
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
        changed ? feedbackEmit.success(success) : feedbackEmit.warning(warning);
        return form;
      } else {
        const { message } = await response.json();
        feedbackEmit.error(message);
        return await loadForm(form.path);
      }
    },
    [loadForm, feedbackEmit]
  );

  const onUnpublish = useCallback(
    async (form) => {
      const response = await fetch(`/api/published-forms/${form.path}`, {
        method: "DELETE",
        headers: { "Bygger-Formio-Token": Formiojs.getToken() },
      });
      if (response.ok) {
        const { form } = await response.json();
        feedbackEmit.success("Satt i gang avpublisering, dette kan ta noen minutter.");
        return form;
      } else {
        const { message } = await response.json();
        feedbackEmit.error(message);
        return await loadForm(form.path);
      }
    },
    [loadForm, feedbackEmit]
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

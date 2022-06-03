import { getIso8601String } from "@navikt/skjemadigitalisering-shared-components";
import Formiojs from "formiojs/Formio";
import { useCallback } from "react";
import { useAuth } from "../context/auth-context";

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
    (callbackForm, silent = false, formProps = undefined) => {
      const props = { ...formProps };
      if (!props.modified) {
        props.modified = getIso8601String();
        props.modifiedBy = userData.name;
      }
      return formio
        .saveForm({ ...updateProps(callbackForm, props), display: "wizard" })
        .then((form) => {
          if (!silent) {
            userAlerter.flashSuccessMessage("Lagret skjema " + form.title);
          }
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
      const publishedLanguages = translations ? Object.keys(translations) : [];
      const now = getIso8601String();
      const formWithPublishProps = updateProps(form, {
        published: now,
        publishedBy: userData.name,
        publishedLanguages,
      });
      const result = await onSave(formWithPublishProps, true, {
        modified: now,
        modifiedBy: userData.name,
      });
      if (!result.error) {
        const payload = JSON.stringify({
          form: result,
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
          const rollbackForm = updateProps(result, {
            published: form.properties?.published,
            publishedBy: form.properties?.publishedBy,
            publishedLanguages: form.properties?.publishedLanguages,
          });
          const rollbackResult = await onSave(rollbackForm, true, {
            modified: form.properties?.modified,
            modifiedBy: form.properties?.modifiedBy,
          });
          if (rollbackResult.error) {
            return result;
          }
          return rollbackResult;
        }
      }
    },
    [userAlerter, onSave, userData]
  );

  const updateProps = (form, props) => {
    return JSON.parse(
      JSON.stringify({
        ...form,
        properties: {
          ...form.properties,
          ...props,
        },
      })
    );
  };

  return {
    deleteForm,
    loadForm,
    loadFormsList,
    onSave,
    onPublish,
  };
};

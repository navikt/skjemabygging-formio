import { NavFormioJs, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { useCallback } from 'react';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext.js';

export const useFormioForms = () => {
  const feedbackEmit = useFeedbackEmit();
  const { http } = useAppConfig();

  const loadFormsList = useCallback(async () => {
    return await http.get('/api/forms?select=title,path,tags,properties,modified,_id');
  }, [http]);

  const loadForm = useCallback(async (formPath) => http.get(`/api/forms/${formPath}`), [http]);

  const onCopyFromProd = useCallback(
    async (formPath) => {
      try {
        const savedForm = await http.put(
          `/api/forms/${formPath}/overwrite-with-prod`,
          {},
          {
            'Bygger-Formio-Token': NavFormioJs.Formio.getToken(),
          },
        );
        feedbackEmit.success('Skjemaet er kopiert fra produksjon');
        return savedForm;
      } catch (error) {
        if (error instanceof http.UnauthenticatedError) {
          feedbackEmit.error('Kopiering feilet. Du har blitt logget ut.');
        } else {
          feedbackEmit.error(error.message);
        }
        return { error: true };
      }
    },
    [feedbackEmit, http],
  );

  const onSave = useCallback(
    async (callbackForm) => {
      try {
        const savedForm = await http.put(
          `/api/forms/${callbackForm.path}`,
          {
            ...callbackForm,
            display: 'wizard',
          },
          {
            'Bygger-Formio-Token': NavFormioJs.Formio.getToken(),
          },
        );
        feedbackEmit.success(`Lagret skjema ${savedForm.title}`);
        return savedForm;
      } catch (error) {
        if (error instanceof http.UnauthenticatedError) {
          feedbackEmit.error('Lagring feilet. Du har blitt logget ut.');
        } else {
          feedbackEmit.error(
            'Lagring feilet. Skjemaet kan ha blitt lagret fra en annen nettleser. Last siden på nytt for å få siste versjon.',
          );
        }
        return { error: true };
      }
    },
    [feedbackEmit, http],
  );

  const onUpdateFormSettings = useCallback(
    async (formPath, properties) => {
      const { isLockedForm, lockedFormReason } = properties;
      try {
        const updatedForm = await http.put(
          `/api/forms/${formPath}/form-settings`,
          {
            isLockedForm,
            lockedFormReason,
          },
          {
            'Bygger-Formio-Token': NavFormioJs.Formio.getToken(),
          },
        );
        feedbackEmit.success(
          updatedForm.properties.isLockedForm
            ? 'Skjemaet ble låst for redigering'
            : 'Skjemaet ble åpnet for redigering',
        );
        return updatedForm;
      } catch (error) {
        if (error instanceof http.UnauthenticatedError) {
          feedbackEmit.error(
            isLockedForm
              ? 'Åpning av skjemaet feilet. Du har blitt logget ut'
              : 'Låsing feilet. Du har blitt logget ut.',
          );
        } else {
          feedbackEmit.error(error.message);
        }
        return { error: true };
      }
    },
    [feedbackEmit, http],
  );

  const onPublish = useCallback(
    async (form, translations) => {
      const payload = JSON.stringify({ form, translations });
      const response = await fetch(`/api/published-forms/${form.path}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'Bygger-Formio-Token': NavFormioJs.Formio.getToken(),
        },
        body: payload,
      });

      if (response?.ok) {
        const success = 'Satt i gang publisering, dette kan ta noen minutter.';
        const warning =
          'Publiseringen inneholdt ingen endringer og ble avsluttet (nytt bygg av Fyllut ble ikke trigget)';

        const { changed, form } = await response.json();
        if (changed) {
          feedbackEmit.success(success);
        } else {
          feedbackEmit.warning(warning);
        }
        return form;
      } else {
        const { message } = await response.json();
        feedbackEmit.error(message);
        return await loadForm(form.path);
      }
    },
    [loadForm, feedbackEmit],
  );

  const onUnpublish = useCallback(
    async (form) => {
      const response = await fetch(`/api/published-forms/${form.path}`, {
        method: 'DELETE',
        headers: { 'Bygger-Formio-Token': NavFormioJs.Formio.getToken() },
      });
      if (response.ok) {
        const { form } = await response.json();
        feedbackEmit.success('Satt i gang avpublisering, dette kan ta noen minutter.');
        return form;
      } else {
        const { message } = await response.json();
        feedbackEmit.error(message);
        return await loadForm(form.path);
      }
    },
    [loadForm, feedbackEmit],
  );

  return {
    loadForm,
    loadFormsList,
    onSave,
    onPublish,
    onUnpublish,
    onCopyFromProd,
    onUpdateFormSettings,
  };
};

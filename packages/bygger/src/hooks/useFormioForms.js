import { NavFormioJs, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { useCallback } from 'react';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';

export const useFormioForms = (formio) => {
  const feedbackEmit = useFeedbackEmit();
  const { http } = useAppConfig();

  const loadFormsList = useCallback(() => {
    return formio.loadForms({
      params: {
        type: 'form',
        tags: 'nav-skjema',
        limit: 1000,
        select: 'title, path, tags, properties, modified, _id',
      },
    });
  }, [formio]);

  const loadForm = useCallback(async (formPath) => http.get(`/api/forms/${formPath}`), []);

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
    [feedbackEmit],
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
        changed ? feedbackEmit.success(success) : feedbackEmit.warning(warning);
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
  };
};

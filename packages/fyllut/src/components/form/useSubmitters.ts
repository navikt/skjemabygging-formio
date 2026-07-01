import { sendInnSoknadApi, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, formioFormsApiUtils, Language, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { FormPersistenceHandlers } from '@navikt/skjemadigitalisering-shared-frontend';
import { useMemo, useRef } from 'react';

/**
 * Builds the injected persistence handlers for the new renderer path, branching per submission
 * method. shared-frontend stays decoupled: it only orchestrates when to call these, while fyllut
 * owns the concrete send-inn / mellomlagring IO and the innsendingsId lifecycle.
 *
 * - digital: mellomlagring (create then update draft) + final submit via updateUtfyltSoknad.
 * - digitalnologin: single nologin-application submit (wired, not yet e2e-verified).
 * - paper: finalization is handled by the legacy letter/PDF flow (wired, not yet e2e-verified).
 */
const useSubmitters = (form: Form): FormPersistenceHandlers => {
  const appConfig = useAppConfig();
  const { currentLanguage } = useLanguages();
  const { submissionMethod, logger } = appConfig;
  const innsendingsIdRef = useRef<string | undefined>(undefined);

  return useMemo<FormPersistenceHandlers>(() => {
    // Convert at the legacy sendInnSoknadApi boundary (shared-components still uses NavFormType)
    const navForm = formioFormsApiUtils.mapFormToNavForm(form);
    const isDigital = submissionMethod === 'digital';

    const saveDraft = isDigital
      ? async (submission: Submission) => {
          if (!innsendingsIdRef.current) {
            const response = await sendInnSoknadApi.createSoknad(appConfig, navForm, submission, currentLanguage);
            if (response && 'innsendingsId' in response) {
              innsendingsIdRef.current = response.innsendingsId;
            }
          } else {
            await sendInnSoknadApi.updateSoknad(
              appConfig,
              navForm,
              submission,
              currentLanguage,
              innsendingsIdRef.current,
            );
          }
        }
      : undefined;

    const submitForm = async (submission: Submission) => {
      switch (submissionMethod) {
        case 'digital': {
          if (!innsendingsIdRef.current) {
            const response = await sendInnSoknadApi.createSoknad(appConfig, navForm, submission, currentLanguage);
            if (response && 'innsendingsId' in response) {
              innsendingsIdRef.current = response.innsendingsId;
            }
          }
          await sendInnSoknadApi.updateUtfyltSoknad(
            appConfig,
            navForm,
            submission,
            currentLanguage,
            innsendingsIdRef.current,
            (location) => {
              window.location.href = location;
            },
          );
          break;
        }
        case 'digitalnologin': {
          await sendInnSoknadApi.postNologinSoknad(
            appConfig,
            '',
            navForm,
            submission,
            currentLanguage as Language,
            submissionMethod,
            innsendingsIdRef.current,
          );
          break;
        }
        default: {
          logger?.info?.('paper submission finalization is not yet implemented', {
            formPath: form.path,
            submissionMethod,
          });
        }
      }
    };

    return { saveDraft, submitForm };
  }, [appConfig, form, currentLanguage, submissionMethod, logger]);
};

export default useSubmitters;

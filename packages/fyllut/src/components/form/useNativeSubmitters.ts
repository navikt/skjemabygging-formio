import { sendInnSoknadApi, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Language, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { FormPersistenceHandlers } from '@navikt/skjemadigitalisering-shared-frontend';
import { useMemo, useRef } from 'react';

/**
 * Builds the injected persistence handlers for the native render path, branching per submission
 * method. shared-frontend stays decoupled: it only orchestrates when to call these, while fyllut
 * owns the concrete send-inn / mellomlagring IO and the innsendingsId lifecycle.
 *
 * - digital: mellomlagring (create then update draft) + final submit via updateUtfyltSoknad.
 * - digitalnologin: single nologin-application submit (wired, not yet e2e-verified).
 * - paper: finalization is handled by the legacy letter/PDF flow (wired, not yet e2e-verified).
 */
const useNativeSubmitters = (form: NavFormType): FormPersistenceHandlers => {
  const appConfig = useAppConfig();
  const { currentLanguage } = useLanguages();
  const { submissionMethod, logger } = appConfig;
  const innsendingsIdRef = useRef<string | undefined>(undefined);

  return useMemo<FormPersistenceHandlers>(() => {
    const isDigital = submissionMethod === 'digital';

    const saveDraft = isDigital
      ? async (submission: Submission) => {
          if (!innsendingsIdRef.current) {
            const response = await sendInnSoknadApi.createSoknad(appConfig, form, submission, currentLanguage);
            if (response && 'innsendingsId' in response) {
              innsendingsIdRef.current = response.innsendingsId;
            }
          } else {
            await sendInnSoknadApi.updateSoknad(appConfig, form, submission, currentLanguage, innsendingsIdRef.current);
          }
        }
      : undefined;

    const submitForm = async (submission: Submission) => {
      switch (submissionMethod) {
        case 'digital': {
          if (!innsendingsIdRef.current) {
            const response = await sendInnSoknadApi.createSoknad(appConfig, form, submission, currentLanguage);
            if (response && 'innsendingsId' in response) {
              innsendingsIdRef.current = response.innsendingsId;
            }
          }
          await sendInnSoknadApi.updateUtfyltSoknad(
            appConfig,
            form,
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
            form,
            submission,
            currentLanguage as Language,
            submissionMethod,
            innsendingsIdRef.current,
          );
          break;
        }
        default: {
          logger?.info?.('Native render: paper submission finalization is not yet implemented', {
            formPath: form.path,
            submissionMethod,
          });
        }
      }
    };

    return { saveDraft, submitForm };
  }, [appConfig, form, currentLanguage, submissionMethod, logger]);
};

export default useNativeSubmitters;

import { getNavId, navFormUtils, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router';
import { AttachmentUploadProvider } from '../../context/attachment/AttachmentUploadContext';
import { clearAttachmentFiles, collectStoredAttachments } from '../../context/attachment/attachmentData';
import { standaloneAttachmentsPath } from '../../context/attachment/attachmentSubmission';
import {
  useFormDefinitionForm,
  useFormDefinitionSubmissionMethod,
} from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { StateStoreProvider, useOptionalFieldStateStore } from '../../context/state/StateContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useIntegration } from '../context/integration/IntegrationContext';
import { useNologinToken } from '../context/nologin-token/NologinTokenContext';

const FyllutAttachmentProvider = ({ children }: { children: ReactNode }) => {
  const store = useOptionalFieldStateStore();
  const { getLatestSubmission, setSubmission } = useSubmissionState();
  const { attachments, sessions } = useRuntimeServices();
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const form = useFormDefinitionForm();
  const { getNologinToken, handleSessionExpired } = useNologinToken();
  const { logEvent } = useIntegration();
  const { translate } = useLanguage();
  const { search } = useLocation();
  const adaptedStore = useMemo(
    () => ({
      subscribe: store?.subscribe ?? (() => () => undefined),
      getValue: (path: string) =>
        path === standaloneAttachmentsPath ? getLatestSubmission()?.attachments : store?.getValue(path),
      setValue: (path: string, value: unknown) => {
        if (path !== standaloneAttachmentsPath) return store?.setValue(path, value);
        setSubmission((current) => ({ ...(current ?? { data: {} }), attachments: value as SubmissionAttachment[] }));
        return getLatestSubmission();
      },
    }),
    [getLatestSubmission, setSubmission, store],
  );

  return (
    <StateStoreProvider store={adaptedStore}>
      <AttachmentUploadProvider
        host={{
          service: attachments,
          getApplication: async () =>
            submissionMethod === 'digitalnologin'
              ? { type: 'noLogin', token: await getNologinToken() }
              : { type: 'draft', id: new URLSearchParams(search).get('innsendingsId') ?? undefined },
          isAuthenticationError: sessions.isAuthenticationError,
          handleSessionExpired,
          getAllAttachments: () => collectStoredAttachments(getLatestSubmission()),
          clearFiles: () =>
            setSubmission((current) =>
              current
                ? {
                    ...current,
                    data: clearAttachmentFiles(current.data),
                    attachments: clearAttachmentFiles(current.attachments),
                  }
                : current,
            ),
          onUpload: (attachment) => {
            void logEvent?.({
              name: 'last opp',
              data: {
                type: 'vedlegg',
                skjemaId: form.properties.skjemanummer,
                tema: form.properties.tema,
                attachmentId: attachment.attachmentId,
                submissionMethod,
                tittel: translate(
                  attachment.type === 'personal-id'
                    ? TEXTS.statiske.uploadId.label
                    : (navFormUtils
                        .flattenComponents(form.components)
                        .find((component) => (getNavId(component) ?? component.key) === attachment.navId)?.label ??
                        attachment.navId),
                ),
              },
            });
          },
        }}
      >
        {children}
      </AttachmentUploadProvider>
    </StateStoreProvider>
  );
};

export default FyllutAttachmentProvider;

import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Form, TranslateFunction, UploadedFile, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormRendererAttachmentAdapter } from '@navikt/skjemadigitalisering-shared-frontend';
import { useMemo } from 'react';
import { useLocation } from 'react-router';

const PDF_FILE_EXTENSION = '.pdf';

const normalizeDownloadFileName = (fileName: string) => {
  const withoutExtension = fileName
    .trim()
    .replace(/\.[^./\\]+$/u, '')
    .replace(/\.+$/u, '');
  return `${withoutExtension || 'attachment'}${PDF_FILE_EXTENSION}`;
};

const normalizeDownloadBlob = (blob: Blob): Blob => {
  const contentType = blob.type.toLowerCase();
  return !contentType || contentType.startsWith('application/octet-stream')
    ? new Blob([blob], { type: 'application/pdf' })
    : blob;
};

const downloadBlob = (content: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  try {
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
};

const useAttachmentAdapter = (
  form: Form,
  getNoLoginToken: () => Promise<string | undefined>,
  translate: TranslateFunction,
): FormRendererAttachmentAdapter => {
  const { http, logEvent, submissionMethod } = useAppConfig();
  const { search } = useLocation();
  const innsendingsId = new URLSearchParams(search).get('innsendingsId') ?? undefined;

  return useMemo(() => {
    const applicationUrl =
      submissionMethod === 'digital'
        ? `/fyllut/api/send-inn/digital-application/${innsendingsId ?? ''}`
        : '/fyllut/api/send-inn/nologin-application';
    const headers = (token?: string) => (token ? { NologinToken: token } : undefined);

    return {
      uploadFile: async (attachmentId, file) => {
        const token = await getNoLoginToken();
        const formData = new FormData();
        formData.append('filinnhold', file);
        return await http!.postFile<UploadedFile>(
          `${applicationUrl}/attachments/${attachmentId}`,
          formData,
          headers(token),
        );
      },
      deleteFile: async (attachmentId, fileId) => {
        const token = await getNoLoginToken();
        await http!.delete(`${applicationUrl}/attachments/${attachmentId}/${fileId}`, undefined, headers(token));
      },
      deleteAllFilesForAttachment: async (attachmentId) => {
        const token = await getNoLoginToken();
        await http!.delete(`${applicationUrl}/attachments/${attachmentId}`, undefined, headers(token));
      },
      deleteAllFiles: async () => {
        const token = await getNoLoginToken();
        await http!.delete(applicationUrl, undefined, headers(token));
      },
      downloadFile: async (attachmentId, fileId, fileName) => {
        const token = await getNoLoginToken();
        const content = await http!.get<Blob>(
          `${applicationUrl}/attachments/${attachmentId}/${fileId}`,
          headers(token),
        );
        downloadBlob(normalizeDownloadBlob(content), normalizeDownloadFileName(fileName));
      },
      onFileUploaded: (attachmentId, navId) => {
        const component = navFormUtils
          .flattenComponents(form.components)
          .find((entry) => entry.type === 'attachment' && navFormUtils.getNavId(entry) === navId);
        logEvent?.({
          name: 'last opp',
          data: {
            type: 'vedlegg',
            skjemaId: form.properties.skjemanummer,
            tema: form.properties.tema,
            tittel: translate(component?.label) ?? '',
            attachmentId,
            submissionMethod,
          },
        });
      },
    };
  }, [form, getNoLoginToken, http, innsendingsId, logEvent, submissionMethod, translate]);
};

export { useAttachmentAdapter };

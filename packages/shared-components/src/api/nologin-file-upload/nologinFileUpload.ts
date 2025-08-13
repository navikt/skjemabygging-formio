import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';

const url = '/fyllut/api/nologin-file';

const uploadFile = async (file: File, attachmentId: string, innsendingsId?: string): Promise<UploadedFile> => {
  const searchParams = `?attachmentId=${attachmentId}${innsendingsId ? `&innsendingsId=${innsendingsId}` : ''}`;

  const formData = new FormData();
  formData.append('filinnhold', file);
  const response = await fetch(`${url}${searchParams}`, { method: 'POST', body: formData });

  if (response.ok) {
    return response.json();
  }
  throw new Error(`Failed to upload file: ${response.statusText}`);
};

const deleteFile = async (fileId: string, innsendingsId: string): Promise<void> => {
  const response = await fetch(`${url}/${fileId}?innsendingId=${innsendingsId}`, { method: 'DELETE' });
  if (response.ok) {
    return;
  }
  throw new Error(`Failed to delete file: ${response.statusText}`);
};

const deleteAttachment = async (attachmentId: string, innsendingsId: string): Promise<void> => {
  const response = await fetch(`${url}?attachmentId=${attachmentId}&innsendingId=${innsendingsId}`, {
    method: 'DELETE',
  });
  if (response.ok) {
    return;
  }
  throw new Error(`Failed to delete attachment: ${response.statusText}`);
};

const deleteAllFiles = async (innsendingsId: string): Promise<void> => {
  const response = await fetch(`${url}?innsendingId=${innsendingsId}`, { method: 'DELETE' });
  if (response.ok) {
    return;
  }
  throw new Error(`Failed to delete all files: ${response.statusText}`);
};

export { deleteAllFiles, deleteAttachment, deleteFile, uploadFile };

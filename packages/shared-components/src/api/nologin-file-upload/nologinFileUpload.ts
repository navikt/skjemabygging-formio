import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';

const url = '/fyllut/api/nologin-file';

const uploadFile = async (file: File, attachmentId: string, token?: string): Promise<UploadedFile> => {
  const searchParams = `?attachmentId=${attachmentId}`;

  const headers = {
    NologinToken: token,
  } as HeadersInit;

  const formData = new FormData();
  formData.append('filinnhold', file);

  const response = await fetch(`${url}${searchParams}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.ok) {
    return response.json();
  }
  throw new Error(`Failed to upload file: ${response.statusText}`);
};

const deleteFile = async (fileId: string, token?: string): Promise<void> => {
  const response = await fetch(`${url}/${fileId}`, {
    method: 'DELETE',
    headers: { NologinToken: token } as HeadersInit,
  });
  if (response.ok) {
    return;
  }
  throw new Error(`Failed to delete file: ${response.statusText}`);
};

const deleteAttachment = async (attachmentId: string, token?: string): Promise<void> => {
  const response = await fetch(`${url}?attachmentId=${attachmentId}`, {
    method: 'DELETE',
    headers: { NologinToken: token } as HeadersInit,
  });
  if (response.ok) {
    return;
  }
  throw new Error(`Failed to delete attachment: ${response.statusText}`);
};

const deleteAllFiles = async (token?: string): Promise<void> => {
  const response = await fetch(`${url}`, {
    method: 'DELETE',
    headers: { NologinToken: token } as HeadersInit,
  });
  if (response.ok) {
    return;
  }
  throw new Error(`Failed to delete all files: ${response.statusText}`);
};

export { deleteAllFiles, deleteAttachment, deleteFile, uploadFile };

import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';

const url = '/fyllut/api/nologin-file';

const uploadFile = async (file: File, vedleggId: string, innsendingsId?: string): Promise<UploadedFile> => {
  const searchParams = `?vedleggId=${vedleggId}${innsendingsId ? `&innsendingsId=${innsendingsId}` : ''}`;

  const formData = new FormData();
  formData.append('filinnhold', file);
  const response = await fetch(`${url}${searchParams}`, { method: 'POST', body: formData });

  if (response.ok) {
    return response.json();
  }
  throw new Error(`Failed to upload file: ${response.statusText}`);
};

const deleteFile = async (filId: string, innsendingsId?: string): Promise<void> => {
  const response = await fetch(`${url}/${filId}?innsendingId=${innsendingsId}`, { method: 'DELETE' });
  if (response.ok) {
    return;
  }
  throw new Error(`Failed to delete file: ${response.statusText}`);
};

export { deleteFile, uploadFile };

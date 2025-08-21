import { AppConfigContextType } from '../../context/config/configContext';

const getHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {};
  if (token) {
    headers['NologinToken'] = token;
  }
  return headers;
};

const postFile = async (url: string, file: File, config: AppConfigContextType, token?: string) => {
  const { HttpError } = config.http || {};

  const formData = new FormData();
  formData.append('filinnhold', file);

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(token),
    body: formData,
  });
  if (!response.ok) {
    if (HttpError) {
      throw new HttpError(`Failed to upload file: ${response.statusText}`, response.status);
    }
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  return response.json();
};

const deleteFiles = async (url: string, config: AppConfigContextType, token?: string) => {
  const { HttpError } = config.http || {};

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(token),
  });

  if (!response.ok) {
    if (HttpError) {
      throw new HttpError(`Failed to delete files: ${response.statusText}`, response.status);
    }
    throw new Error(`Failed to delete files: ${response.statusText}`);
  }
};

export { deleteFiles, postFile };

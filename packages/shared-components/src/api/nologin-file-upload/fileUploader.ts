import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';
import { FetchHeader, http } from '../../index';

const getHeaders = (token?: string): FetchHeader => {
  const headers: FetchHeader = {};
  if (token) {
    headers.NologinToken = token;
  }
  return headers;
};

const postFile = async (
  url: string,
  file: File,
  config: AppConfigContextType,
  token?: string,
): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append('filinnhold', file);

  return await http.postFile<UploadedFile>(url, formData, getHeaders(token));
};

const deleteFiles = async (url: string, config: AppConfigContextType, token?: string): Promise<void> => {
  return await http.delete(url, undefined, getHeaders(token));
};

export { deleteFiles, postFile };

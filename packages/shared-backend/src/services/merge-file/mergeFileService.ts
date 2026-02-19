import mergeFileApiService from './mergeFileApiService';

interface MergeFilesBodyType {
  title: string;
  language: string;
  files: string[];
}
interface MergeFilesProps {
  baseUrl: string;
  accessToken: string;
  body: MergeFilesBodyType;
}
const mergeFiles = async (props: MergeFilesProps): Promise<any> => {
  const { baseUrl, body, accessToken } = props;

  const requestBody = {
    tittel: body.title,
    spraak: body.language,
    filer: body.files,
  };

  return mergeFileApiService.mergeFiles({
    baseUrl,
    body: requestBody,
    accessToken,
  });
};

const mergeFileService = {
  mergeFiles,
};

export default mergeFileService;

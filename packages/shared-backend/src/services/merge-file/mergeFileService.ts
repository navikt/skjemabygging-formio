import mergeFileApiService from './mergeFileApiService';

interface MergeFilesBodyType {
  title: string;
  language: string;
  files: string[];
}
interface MergeFilesProps {
  accessToken: string;
  body: MergeFilesBodyType;
}
type MergeFileApiService = Pick<typeof mergeFileApiService, 'mergeFiles'>;

type MergeFileService = {
  mergeFiles: (props: MergeFilesProps) => Promise<any>;
};

interface CreateMergeFileServiceProps {
  baseUrl: string;
  apiService?: MergeFileApiService;
}

const createMergeFileService = ({
  baseUrl,
  apiService = mergeFileApiService,
}: CreateMergeFileServiceProps): MergeFileService => {
  const mergeFiles = async (props: MergeFilesProps): Promise<any> => {
    const { body, accessToken } = props;

    const requestBody = {
      tittel: body.title,
      spraak: body.language,
      filer: body.files,
    };

    return apiService.mergeFiles({
      baseUrl,
      body: requestBody,
      accessToken,
    });
  };

  return {
    mergeFiles,
  };
};

export { createMergeFileService };
export type { MergeFileService };

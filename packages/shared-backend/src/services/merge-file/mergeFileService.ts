import mergeFileClient from './mergeFileClient';

interface MergeFilesBodyType {
  title: string;
  language: string;
  files: string[];
}
interface MergeFilesProps {
  accessToken: string;
  body: MergeFilesBodyType;
}
type MergeFileClient = Pick<typeof mergeFileClient, 'mergeFiles'>;

type MergeFileService = {
  mergeFiles: (props: MergeFilesProps) => Promise<any>;
};

interface CreateMergeFileServiceProps {
  baseUrl: string;
  client?: MergeFileClient;
}

const createMergeFileService = ({
  baseUrl,
  client = mergeFileClient,
}: CreateMergeFileServiceProps): MergeFileService => {
  const mergeFiles = async (props: MergeFilesProps): Promise<any> => {
    const { body, accessToken } = props;

    const requestBody = {
      tittel: body.title,
      spraak: body.language,
      filer: body.files,
    };

    return client.mergeFiles({
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

import type { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import applicationClient from './applicationClient';
import type {
  ApplicationMetrics,
  ApplicationPaths,
  ApplicationType,
  DownloadedAttachment,
  DraftResponse,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
} from './applicationTypes';

type ApplicationClient = Pick<
  typeof applicationClient,
  | 'getSoknad'
  | 'createSoknad'
  | 'updateSoknad'
  | 'deleteSoknad'
  | 'submitUtfyltSoknad'
  | 'uploadAttachment'
  | 'deleteAttachment'
  | 'downloadAttachment'
  | 'submitApplication'
>;

interface CreateApplicationServiceProps {
  baseUrl: string;
  paths: ApplicationPaths;
  metrics?: ApplicationMetrics;
  client?: ApplicationClient;
}

interface ApplicationBaseProps {
  accessToken: string;
  innsendingsId: string;
  correlationId?: string;
}

interface CreateSoknadProps extends ApplicationBaseProps {
  body: object;
  force?: boolean;
  envQualifier?: string;
}

interface UpdateSoknadProps extends ApplicationBaseProps {
  body: object;
}

interface SubmitUtfyltSoknadProps extends UpdateSoknadProps {
  envQualifier?: string;
}

interface AttachmentBaseProps extends ApplicationBaseProps {
  attachmentId: string;
  type: ApplicationType;
}

interface UploadAttachmentProps extends AttachmentBaseProps {
  fileBlob: Blob;
  fileName: string;
}

interface DeleteAttachmentProps extends ApplicationBaseProps {
  attachmentId?: string;
  fileId?: string;
  type: ApplicationType;
}

interface DownloadAttachmentProps extends AttachmentBaseProps {
  fileId: string;
}

interface SubmitApplicationProps extends ApplicationBaseProps {
  body: SubmitApplicationRequest;
  type: ApplicationType;
}

type ApplicationService = {
  getSoknad: <T>(props: ApplicationBaseProps) => Promise<T>;
  createSoknad: <T>(props: CreateSoknadProps) => Promise<DraftResponse<T>>;
  updateSoknad: <T>(props: UpdateSoknadProps) => Promise<T>;
  deleteSoknad: <T>(props: ApplicationBaseProps) => Promise<T>;
  submitUtfyltSoknad: (props: SubmitUtfyltSoknadProps) => Promise<{ status: number; location?: string }>;
  uploadAttachment: (props: UploadAttachmentProps) => Promise<UploadedFile>;
  deleteAttachment: (props: DeleteAttachmentProps) => Promise<void>;
  downloadAttachment: (props: DownloadAttachmentProps) => Promise<DownloadedAttachment>;
  submitApplication: (props: SubmitApplicationProps) => Promise<SubmitApplicationResponse>;
};

const createApplicationService = ({
  baseUrl,
  paths,
  metrics,
  client = applicationClient,
}: CreateApplicationServiceProps): ApplicationService => {
  const getSoknad = async <T>(props: ApplicationBaseProps) => await client.getSoknad<T>({ ...props, baseUrl, paths });

  const createSoknad = async <T>(props: CreateSoknadProps) =>
    await client.createSoknad<T>({ ...props, baseUrl, paths });

  const updateSoknad = async <T>(props: UpdateSoknadProps) =>
    await client.updateSoknad<T>({ ...props, baseUrl, paths });

  const deleteSoknad = async <T>(props: ApplicationBaseProps) =>
    await client.deleteSoknad<T>({ ...props, baseUrl, paths });

  const submitUtfyltSoknad = async (props: SubmitUtfyltSoknadProps) =>
    await client.submitUtfyltSoknad({ ...props, baseUrl, paths });

  const uploadAttachment = async (props: UploadAttachmentProps) => {
    const stopTimer = metrics?.uploadDuration.startTimer({ type: props.type });
    let uploadError = false;
    try {
      return await client.uploadAttachment({ ...props, baseUrl });
    } catch (error) {
      uploadError = true;
      throw error;
    } finally {
      const errorLabel = String(uploadError);
      metrics?.uploadFileSize.observe({ type: props.type, error: errorLabel }, props.fileBlob.size);
      stopTimer?.({ error: errorLabel });
    }
  };

  const deleteAttachment = async (props: DeleteAttachmentProps) => await client.deleteAttachment({ ...props, baseUrl });

  const downloadAttachment = async (props: DownloadAttachmentProps) =>
    await client.downloadAttachment({ ...props, baseUrl });

  const submitApplication = async (props: SubmitApplicationProps) =>
    await client.submitApplication({ ...props, baseUrl });

  return {
    createSoknad,
    deleteAttachment,
    deleteSoknad,
    downloadAttachment,
    getSoknad,
    submitApplication,
    submitUtfyltSoknad,
    updateSoknad,
    uploadAttachment,
  };
};

export { createApplicationService };
export type { ApplicationService };

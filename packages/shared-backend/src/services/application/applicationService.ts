import type { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import type { LogMetadata } from '../../shared';
import applicationClient from './applicationClient';
import type {
  ApplicationMetrics,
  ApplicationType,
  DownloadedAttachment,
  DraftResponse,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
} from './applicationTypes';

type ApplicationClient = Pick<
  typeof applicationClient,
  | 'getApplication'
  | 'createApplication'
  | 'updateApplication'
  | 'deleteApplication'
  | 'submitCompletedApplication'
  | 'uploadAttachment'
  | 'deleteAttachment'
  | 'downloadAttachment'
  | 'submitApplication'
>;

interface CreateApplicationServiceProps {
  baseUrl: string;
  metrics?: ApplicationMetrics;
  client?: ApplicationClient;
}

interface ApplicationBaseProps {
  accessToken: string;
  innsendingsId: string;
  correlationId?: string;
  logMeta?: LogMetadata;
}

interface CreateApplicationProps extends ApplicationBaseProps {
  body: object;
  force?: boolean;
  envQualifier?: string;
}

interface UpdateApplicationProps extends ApplicationBaseProps {
  body: object;
}

interface SubmitCompletedApplicationProps extends UpdateApplicationProps {
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
  getApplication: <T>(props: ApplicationBaseProps) => Promise<T>;
  createApplication: <T>(props: CreateApplicationProps) => Promise<DraftResponse<T>>;
  updateApplication: <T>(props: UpdateApplicationProps) => Promise<T>;
  deleteApplication: <T>(props: ApplicationBaseProps) => Promise<T>;
  submitCompletedApplication: (
    props: SubmitCompletedApplicationProps,
  ) => Promise<{ status: number; location?: string }>;
  uploadAttachment: (props: UploadAttachmentProps) => Promise<UploadedFile>;
  deleteAttachment: (props: DeleteAttachmentProps) => Promise<void>;
  downloadAttachment: (props: DownloadAttachmentProps) => Promise<DownloadedAttachment>;
  submitApplication: (props: SubmitApplicationProps) => Promise<SubmitApplicationResponse>;
};

const createApplicationService = ({
  baseUrl,
  metrics,
  client = applicationClient,
}: CreateApplicationServiceProps): ApplicationService => {
  const getApplication = async <T>(props: ApplicationBaseProps) =>
    await client.getApplication<T>({ ...props, baseUrl });

  const createApplication = async <T>(props: CreateApplicationProps) =>
    await client.createApplication<T>({ ...props, baseUrl });

  const updateApplication = async <T>(props: UpdateApplicationProps) =>
    await client.updateApplication<T>({ ...props, baseUrl });

  const deleteApplication = async <T>(props: ApplicationBaseProps) =>
    await client.deleteApplication<T>({ ...props, baseUrl });

  const submitCompletedApplication = async (props: SubmitCompletedApplicationProps) =>
    await client.submitCompletedApplication({ ...props, baseUrl });

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
    createApplication,
    deleteApplication,
    deleteAttachment,
    downloadAttachment,
    getApplication,
    submitCompletedApplication,
    submitApplication,
    updateApplication,
    uploadAttachment,
  };
};

export { createApplicationService };
export type { ApplicationService };

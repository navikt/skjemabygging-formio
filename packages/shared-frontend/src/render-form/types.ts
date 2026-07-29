import type {
  Component,
  Form,
  ReceiptSummary,
  Submission,
  SubmissionMethod,
  UploadedFile,
} from '@navikt/skjemadigitalisering-shared-domain';
import type { FrameworkAppConfig } from '../context/app-config/AppConfigContext';
import type { FrameworkLanguage } from '../context/language/LanguageContext';
import type { FormPersistenceHandlers } from '../context/persistence/PersistenceContext';

type FormRendererRoute =
  | { kind: 'intro' }
  | { kind: 'panel'; panelKey: string; focusId?: string }
  | { kind: 'attachments' }
  | { kind: 'summary' }
  | { kind: 'receipt'; receipt?: ReceiptSummary; pdfBase64?: string }
  | { kind: 'prepare-submission'; type: 'application' | 'cover-page-and-application' };

interface FormRendererNavigationRequest {
  route: FormRendererRoute;
  submission?: Submission;
  validationErrorPages: string[];
  focusId?: string;
}

interface FormRendererNavigation {
  navigate: (request: FormRendererNavigationRequest) => void;
}

interface FormRendererAttachmentAdapter {
  uploadFile: (attachmentId: string, file: File) => Promise<UploadedFile>;
  deleteFile: (attachmentId: string, fileId: string) => Promise<void>;
  deleteAllFilesForAttachment: (attachmentId: string) => Promise<void>;
  deleteAllFiles: () => Promise<void>;
  downloadFile: (attachmentId: string, fileId: string, fileName: string) => Promise<void>;
  onFileUploaded?: (attachmentId: string, navId: string) => void;
}

interface FormRendererNoLoginAdapter {
  getToken: () => Promise<string | undefined>;
  clearToken?: () => void;
  tokenExpiration?: number;
}

interface FormRendererSecondaryActions {
  exitUrl: string;
  cancel: (submission: Submission | undefined) => Promise<void>;
  showIdentificationAction?: boolean;
  onIdentification?: () => void;
}

interface FormRendererPdfAdapter {
  createPdf: (request: {
    form: Form;
    submission: Submission;
    language: string;
    submissionMethod?: SubmissionMethod;
    type: 'application' | 'cover-page-and-application';
  }) => Promise<Blob | undefined>;
  onDownloaded?: (request: {
    form: Form;
    language: string;
    submissionMethod?: SubmissionMethod;
    type: 'application' | 'cover-page-and-application';
  }) => void;
  getCoverPageAttachments?: (form: Form, submission: Submission) => Component[];
  getAttachmentFormUrl?: (formPath: string) => string;
}

interface FormRendererReceiptAdapter {
  myPageUrl?: string;
  onPdfDownloaded?: (form: Form) => void;
}

interface FormRendererHostAdapter {
  navigation: FormRendererNavigation;
  attachments?: FormRendererAttachmentAdapter;
  noLogin?: FormRendererNoLoginAdapter;
  secondaryActions?: FormRendererSecondaryActions;
  pdf?: FormRendererPdfAdapter;
  receipt?: FormRendererReceiptAdapter;
  languageSelector?: React.ReactNode;
  isLoggedIn?: boolean;
  isDeletedDraftSummary?: boolean;
  onSelectSubmissionMethod?: (submissionMethod: SubmissionMethod) => void;
}

interface SharedFormRendererProps {
  form: Form;
  initialSubmission?: Submission;
  initialPagesWithErrors?: string[];
  language: FrameworkLanguage;
  appConfig: FrameworkAppConfig;
  persistence: FormPersistenceHandlers;
  route: FormRendererRoute;
  host: FormRendererHostAdapter;
  mode?: 'wizard' | 'submission-method-selection';
}

export type {
  FormRendererAttachmentAdapter,
  FormRendererHostAdapter,
  FormRendererNavigation,
  FormRendererNavigationRequest,
  FormRendererNoLoginAdapter,
  FormRendererPdfAdapter,
  FormRendererReceiptAdapter,
  FormRendererRoute,
  FormRendererSecondaryActions,
  SharedFormRendererProps,
};

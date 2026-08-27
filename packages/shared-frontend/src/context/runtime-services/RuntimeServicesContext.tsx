import {
  ComponentValue,
  DataFetcherElement,
  DataFetcherSourceId,
  Enhet,
  ReceiptSummary,
  SendInnAktivitet,
  Submission,
  SubmissionMethod,
  TranslationLang,
  UploadedFile,
} from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext } from 'react';

type FormCodeList = 'areaCodes' | 'currencies';

interface FormDataService {
  getActivities: (request?: { dailyTravel?: boolean }) => Promise<SendInnAktivitet[]>;
  getRegisterData: (request: {
    sourceId: DataFetcherSourceId;
    queryParams?: Record<string, string>;
  }) => Promise<DataFetcherElement[]>;
  getCodeList: (codeList: FormCodeList) => Promise<ComponentValue[]>;
  getNavUnits: () => Promise<Enhet[]>;
}

interface DraftRequest {
  formPath: string;
  submission: Submission;
  language: TranslationLang;
  submissionMethod?: SubmissionMethod;
}

interface Draft {
  id: string;
  submission: Submission;
  modifiedAt: string;
  deleteAt: string;
}

type CreateDraftResult = { status: 'created'; draft: Draft } | { status: 'alreadyExists' };

interface ApplicationService {
  createDraft: (request: DraftRequest & { force?: boolean }) => Promise<CreateDraftResult>;
  updateDraft: (request: DraftRequest & { id: string }) => Promise<Draft>;
  deleteDraft: (id: string) => Promise<void>;
}

interface SessionService {
  createNoLoginToken: (request?: { honeypot?: string }) => Promise<string | undefined>;
  isAuthenticationError: (error: unknown) => boolean;
}

type AttachmentApplication = { type: 'draft'; id?: string } | { type: 'noLogin'; token?: string };

interface AttachmentService {
  uploadFile: (request: {
    application: AttachmentApplication;
    attachmentId: string;
    file: File;
  }) => Promise<UploadedFile>;
  deleteFile: (request: { application: AttachmentApplication; attachmentId: string; fileId: string }) => Promise<void>;
  downloadFile: (request: {
    application: AttachmentApplication;
    attachmentId: string;
    fileId: string;
  }) => Promise<Blob>;
  deleteAllFilesForAttachment: (request: { application: AttachmentApplication; attachmentId: string }) => Promise<void>;
  deleteAllFiles: (application: AttachmentApplication) => Promise<void>;
}

type SubmissionApplication = { type: 'draft'; id: string } | { type: 'noLogin'; token: string };

interface SubmissionService {
  submit: (request: {
    application: SubmissionApplication;
    formPath: string;
    submission: Submission;
    language: TranslationLang;
    submissionMethod?: SubmissionMethod;
  }) => Promise<{ pdfBase64: string; receipt: ReceiptSummary }>;
  createDocument: (request: {
    documentType: 'application' | 'application-with-cover-page';
    formPath: string;
    submission: Submission;
    language: TranslationLang;
    submissionMethod?: SubmissionMethod;
    navUnitNumber?: string;
  }) => Promise<Blob>;
}

interface RuntimeServices {
  applications: ApplicationService;
  attachments: AttachmentService;
  formData: FormDataService;
  sessions: SessionService;
  submissions: SubmissionService;
}

interface Props {
  children: ReactNode;
  services: RuntimeServices;
}

const RuntimeServicesContext = createContext<RuntimeServices | undefined>(undefined);

const RuntimeServicesProvider = ({ children, services }: Props) => (
  <RuntimeServicesContext.Provider value={services}>{children}</RuntimeServicesContext.Provider>
);

const useRuntimeServices = (): RuntimeServices => {
  const services = useContext(RuntimeServicesContext);
  if (!services) {
    throw new Error('Runtime services are required to render network-backed form components.');
  }
  return services;
};

export { RuntimeServicesProvider, useRuntimeServices };
export type {
  ApplicationService,
  AttachmentApplication,
  AttachmentService,
  CreateDraftResult,
  Draft,
  DraftRequest,
  FormCodeList,
  FormDataService,
  RuntimeServices,
  SessionService,
  SubmissionApplication,
  SubmissionService,
};

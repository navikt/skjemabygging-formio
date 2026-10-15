export type FormClearOptions = {
  keepTestForms: boolean;
  keepLockedForms: boolean;
  keepFormPaths: string[];
};

export type FormClearPreview = {
  toDelete: string[];
  kept: string[];
};

export type FormClearStart = FormClearOptions & {
  expectedToDelete: string[];
  expectedKept: string[];
};

export type FormClearJob = {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalCount: number;
  processedCount: number;
  deletedCount: number;
  keptCount: number;
  failedCount: number;
  items: { path: string; outcome: 'deleted' | 'kept' | 'failed'; error?: string }[];
};

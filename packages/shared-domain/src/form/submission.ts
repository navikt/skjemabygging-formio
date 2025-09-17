import { UploadedFile } from '../file';
import { FyllutState } from './state';

export interface Submission {
  data: SubmissionData;
  uploadedFiles?: UploadedFile[];
  metadata?: SubmissionMetadata;
  state?: string;
  selfDeclaration?: boolean;
  fyllutState?: FyllutState;
}

export type CheckboxGroupSubmissionData = {
  [key: string]: boolean;
};

export type SubmissionData = Record<string, string | number | boolean | any[] | object>;

export type SubmissionMetadata = {
  selectedData: any;
  timezone: string;
  offset: number;
  origin: string;
  referrer: string;
  browserName: string;
  userAgent: string;
  pathName: string;
  onLine: boolean;
  dataFetcher: any;
};

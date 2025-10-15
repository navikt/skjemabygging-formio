import { SubmissionAttachment } from '../attachment';
import { FyllutState } from './state';

export interface Submission {
  data: SubmissionData;
  attachments?: SubmissionAttachment[];
  metadata?: SubmissionMetadata;
  state?: string;
  fyllutState?: FyllutState;
}

export type CheckboxGroupSubmissionData = {
  [key: string]: boolean;
};

export type DineOpplysningerData = {
  fornavn?: string;
  etternavn?: string;
  identitet?: {
    harDuFodselsnummer?: 'ja' | 'nei';
    identitetsnummer?: string;
    fodselsdato?: string;
  };
};

export type SubmissionData = Record<string, string | number | boolean | any[] | object> & {
  dineOpplysninger?: DineOpplysningerData;
  fodselsnummerDNummerSoker?: string;
  fornavnAvsender?: string;
  etternavnAvsender?: string;
};

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

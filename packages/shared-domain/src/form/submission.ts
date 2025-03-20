import { FormPropertiesType } from './formProperties';
import { NavFormType } from './navFormType';
import { FyllutState } from './state';

export interface Submission {
  data: SubmissionData;
  metadata?: {
    selectedData: any;
    timezone: string;
    offset: number;
    origin: string;
    referrer: string;
    browserName: string;
    userAgent: string;
    pathName: string;
    onLine: boolean;
  };
  state?: string;
  fyllutState?: FyllutState;
}

export type SubmissionData = Record<string, string | number | boolean | any[] | object>;

export interface FormsResponseForm extends Pick<NavFormType, '_id' | 'title' | 'path' | 'modified'> {
  properties: Pick<
    FormPropertiesType,
    'skjemanummer' | 'ettersending' | 'subsequentSubmissionTypes' | 'submissionTypes'
  >;
}

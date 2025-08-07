import { Component } from './component';
import { FormPropertiesType } from './formProperties';
import { IntroPage } from './introPage';
import { DisplayType } from './types';

/**
 * @property {number} id - Temporary. Applied from forms-api Form
 */
export interface NavFormType {
  _id?: string;
  tags: string[];
  type: string;
  display: DisplayType;
  name: string;
  title: string;
  path: string;
  key?: string;
  modified?: string;
  properties: FormPropertiesType;
  components: Component[];
  access?: ResourceAccess[];
  project?: string;
  id?: number;
  revision?: number;
  createdAt?: string;
  createdBy?: string;
  changedAt?: string;
  changedBy?: string;
  publishedAt?: string;
  publishedBy?: string;
  publishedLanguages?: string[];
  status?: string;
  introPage?: IntroPage;
  firstPanelSlug?: string;
}

export interface ResourceAccess {
  type: string;
  roles: string[];
}

export interface FormsResponseForm extends Pick<NavFormType, '_id' | 'title' | 'path' | 'modified'> {
  properties: Pick<FormPropertiesType, 'skjemanummer' | 'subsequentSubmissionTypes' | 'submissionTypes'>;
}

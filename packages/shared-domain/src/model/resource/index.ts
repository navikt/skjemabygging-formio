export type ResourceName = 'language' | 'mottaksadresse';

export interface FormioResource {
  _id: string;
  owner?: string;
  roles?: unknown[];
  data: any;
  access?: unknown[];
  form: string;
  externalIds?: unknown[];
  created?: string;
  modified?: string;
  project?: string;
}

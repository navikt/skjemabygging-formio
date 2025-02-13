import { Component, FormPropertiesType } from '../form';

type FormStatus = 'draft' | 'published' | 'pending' | 'unpublished';

type Form = {
  id?: number;
  revision?: number;
  skjemanummer: string;
  path: string;
  title: string;
  components: Component[];
  properties: FormPropertiesType;
  createdAt?: string;
  createdBy?: string;
  changedAt?: string;
  changedBy?: string;
  publishedAt?: string;
  publishedBy?: string;
  status?: FormStatus;
};

export type { Form };

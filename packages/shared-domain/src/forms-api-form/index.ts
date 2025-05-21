import { Component, FormPropertiesType, IntroPage } from '../form';

type FormStatus = 'draft' | 'published' | 'pending' | 'unpublished' | 'unknown';

type FormLock = {
  reason: string;
  lockedBy: string;
  lockedAt: string;
};

type Form = {
  id?: number;
  revision?: number;
  skjemanummer: string;
  path: string;
  title: string;
  components: Component[];
  properties: FormPropertiesType;
  introPage?: IntroPage;
  createdAt?: string;
  createdBy?: string;
  changedAt?: string;
  changedBy?: string;
  publishedAt?: string;
  publishedBy?: string;
  publishedLanguages?: string[];
  status?: FormStatus;
  lock?: FormLock;
};

export type { Form, FormStatus };

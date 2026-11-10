import { Component, FormPropertiesType, IntroPage } from '../form';
import { TranslationLang } from '../translation';

type FormStatus = 'draft' | 'published' | 'pending' | 'unpublished' | 'unknown';

type FormLock = {
  reason: string;
  lockedBy: string;
  lockedAt: string;
};

type Form = {
  id?: number;
  revision?: number;
  publicationId?: string;
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
  firstPanelSlug?: string;
};

/**
 * Computed by fyllut-backend when `languages` is included in `select`; it is never stored on the form.
 */
type FormWithLanguages = Form & {
  languages?: TranslationLang[];
};

export type { Form, FormStatus, FormWithLanguages };

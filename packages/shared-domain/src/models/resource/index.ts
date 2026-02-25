import { Mottaksadresse } from '../mottaksadresse';
import { Language, TranslationResource } from '../translation';

type ResourceName = 'language' | 'mottaksadresse';

interface FormioResource {
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

/**
 * These are types describing published resources on GitHub, not formio entities
 */
type MottaksadresserResourceContent = Mottaksadresse[];
type GlobalTranslationsResourceContent = {
  [lang in Language]?: TranslationResource[];
};

type ResourceContent = MottaksadresserResourceContent | GlobalTranslationsResourceContent;

export type {
  FormioResource,
  GlobalTranslationsResourceContent,
  MottaksadresserResourceContent,
  ResourceContent,
  ResourceName,
};

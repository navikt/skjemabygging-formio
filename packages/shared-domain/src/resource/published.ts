import { Language, TranslationResource } from '../languages/types';
import { Mottaksadresse } from '../mottaksadresse';

/**
 * These are types describing published resources on GitHub, not formio entities
 */
export type MottaksadresserResourceContent = Mottaksadresse[];
export type GlobalTranslationsResourceContent = Record<Language, TranslationResource[]>;

export type ResourceContent = MottaksadresserResourceContent | GlobalTranslationsResourceContent;

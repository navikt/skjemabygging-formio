import { Language, TranslationResource } from '../languages/types';
import { Mottaksadresse } from '../mottaksadresse';

export type MottaksadresserResourceContent = Mottaksadresse[];
export type GlobalTranslationsResourceContent = Record<Language, TranslationResource[]>;

export type ResourceContent = MottaksadresserResourceContent | GlobalTranslationsResourceContent;

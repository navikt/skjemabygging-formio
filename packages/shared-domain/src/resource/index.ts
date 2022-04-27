import { Language, TranslationResource } from "../languages/types";
import { MottaksadresseEntity } from "../mottaksadresse";

export type MottaksadresserResourceContent = MottaksadresseEntity[];
export type GlobalTranslationsResourceContent = Record<Language, TranslationResource[]>;

export type ResourceContent = MottaksadresserResourceContent | GlobalTranslationsResourceContent;

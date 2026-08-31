import { Component, FormComponentType } from '@navikt/skjemadigitalisering-shared-domain';
import type { TypedComponentType } from './definitions';

/**
 * Fallback definition for component types that do not (yet) have a dedicated
 * typed variant. A distributive union with one legacy-`Component`-shaped member
 * per not-yet-typed `type` literal, keeping `ComponentDefinition` total over
 * `FormComponentType`. Shrinks to `never` once every type has a variant.
 */
type GenericComponentDefinition = {
  [K in Exclude<FormComponentType, TypedComponentType>]: Omit<Component, 'type'> & { type: K };
}[Exclude<FormComponentType, TypedComponentType>];

export type { GenericComponentDefinition };

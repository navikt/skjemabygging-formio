import { Component, FormComponentType } from '@navikt/skjemadigitalisering-shared-domain';
import type { TypedComponentType } from './definitions';
import type { ComponentDefinition } from './index';

/**
 * Fallback definition for component types that do not (yet) have a dedicated
 * typed variant. A distributive union with one legacy-`Component`-shaped member
 * per not-yet-typed `type` literal, keeping `ComponentDefinition` total over
 * `FormComponentType`. Shrinks to `never` once every type has a variant.
 *
 * `components` is narrowed to `ComponentDefinition[]` (like `BaseComponentDefinition`)
 * so the whole `ComponentDefinition` tree is self-referential and recursing into
 * children keeps full typing regardless of the parent variant.
 */
type GenericComponentDefinition = {
  [K in Exclude<FormComponentType, TypedComponentType>]: Omit<Component, 'type' | 'components'> & {
    type: K;
    components?: ComponentDefinition[];
  };
}[Exclude<FormComponentType, TypedComponentType>];

export type { GenericComponentDefinition };

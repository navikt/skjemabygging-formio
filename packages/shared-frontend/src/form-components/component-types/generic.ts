import { Component, FormComponentType } from '@navikt/skjemadigitalisering-shared-domain';
import type { MigratedComponentType } from './index';

/**
 * Fallback variant for component types that have NOT yet been migrated to a
 * dedicated typed variant.
 *
 * It is a distributive union with one member per not-yet-migrated `type`
 * literal, each member being the legacy `Component` shape pinned to that single
 * literal. This keeps `AnyFormComponent` total over `FormComponentType` (so the
 * registries and tree-walkers can be typed exhaustively) while migration is
 * still in progress.
 *
 * As component types gain real variants and join `FormComponent`, they drop out
 * of `GenericComponent` automatically, so this escape hatch shrinks to `never`
 * once every type is migrated.
 */
type GenericComponent = {
  [K in Exclude<FormComponentType, MigratedComponentType>]: Omit<Component, 'type'> & { type: K };
}[Exclude<FormComponentType, MigratedComponentType>];

export type { GenericComponent };

import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ResolveContext } from './resolveContext';
import { ResolvedComponentModel } from './resolved-component-model';

type ComponentResolverResult = ResolvedComponentModel | ResolvedComponentModel[] | null;
type ComponentResolver = (component: Component, context: ResolveContext) => ComponentResolverResult;

export type { ComponentResolver, ComponentResolverResult };

import SharedFrontendBoundary from './SharedFrontendBoundary';
import RenderSummaryForm from './shared-form/summary/RenderSummaryForm';

const sharedFrontendPackageName = '@navikt/skjemadigitalisering-shared-frontend';

export type { SharedFrontendBoundaryProps } from './SharedFrontendBoundary';
export type { FormComponentProps, FormComponentRegistry, SummaryRuntimeConfig } from './shared-form/summary/types';
export { RenderSummaryForm, SharedFrontendBoundary, sharedFrontendPackageName };

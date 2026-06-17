import ValidationExclamationIcon from './components/icons/ValidationExclamationIcon';
import RenderSummaryForm from './form-components/RenderSummaryForm';
import SharedFrontendBoundary from './SharedFrontendBoundary';

const sharedFrontendPackageName = '@navikt/skjemadigitalisering-shared-frontend';

export type { RenderSummaryFormProps } from './form-components/RenderSummaryForm';
export type {
  FormComponentProps,
  FormComponentRegistry,
  HandleAttachmentDownloadFile,
  SummaryRendererAppConfig,
} from './form-components/types';
export type { SharedFrontendBoundaryProps } from './SharedFrontendBoundary';
export { RenderSummaryForm, SharedFrontendBoundary, ValidationExclamationIcon, sharedFrontendPackageName };

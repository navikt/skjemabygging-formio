import FormLayout from '../layout/FormLayout';
import { AttachmentUploadProvider } from './attachments/AttachmentUploadContext';
import SubmissionMethodSelection from './SubmissionMethodSelection';
import type { SharedFormRendererProps } from './types';
import WizardContent from './wizard/WizardContent';

const RendererContent = ({
  host,
  route,
  mode = 'wizard',
}: Pick<SharedFormRendererProps, 'host' | 'route' | 'mode'>) => (
  <AttachmentUploadProvider adapter={host.attachments}>
    <FormLayout>
      {host.languageSelector}
      {mode === 'submission-method-selection' ? (
        <SubmissionMethodSelection host={host} />
      ) : (
        <WizardContent host={host} route={route} />
      )}
    </FormLayout>
  </AttachmentUploadProvider>
);

export default RendererContent;

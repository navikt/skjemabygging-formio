import DefaultListAnswer from '../../shared/PdfDefaultListAnswer';
import { PdfComponentProps } from '../../types';
import PdfAttachmentUpload from '../attachment-uploads/PdfAttachmentUpload';
import PdfAttachment from '../attachment/PdfAttachment';

const PdfRadio = (props: PdfComponentProps) => {
  if (props.component.attachmentValues) {
    return props.submissionMethod === 'paper' || props.submissionMethod === 'papernocoverpage'
      ? PdfAttachment(props)
      : PdfAttachmentUpload(props);
  }

  return DefaultListAnswer(props);
};

export default PdfRadio;

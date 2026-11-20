import { Submission } from '../form';
import { SendinnFormRequest } from './form';

interface SendinnCoverPageRequest extends SendinnFormRequest {
  revision: number;
  submission: Submission;
}

interface SendinnCoverPageResult {
  pdfBase64: string;
}

export type { SendinnCoverPageRequest, SendinnCoverPageResult };

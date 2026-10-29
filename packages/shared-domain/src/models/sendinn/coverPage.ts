import { Submission } from '../form';
import { SendinnFormRequest } from './form';

interface SendinnCoverPageRequest extends SendinnFormRequest {
  submission: Submission;
}

interface SendinnCoverPageResult {
  pdf: string;
}

export type { SendinnCoverPageRequest, SendinnCoverPageResult };

import SubmissionAddress from './address';
import SubmissionIdentity from './identity';

interface SubmissionDefault {
  [key: string]: any;
  fornavn?: string;
  etternavn?: string;
  identitet?: SubmissionIdentity;
  address?: SubmissionAddress;
}

export default SubmissionDefault;

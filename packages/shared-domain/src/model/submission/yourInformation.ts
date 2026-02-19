import SubmissionAddress from './address';
import SubmissionIdentity from './identity';

interface SubmissionYourInformation {
  fornavn?: string;
  etternavn?: string;
  identitet?: SubmissionIdentity;
  adresse?: SubmissionAddress;
}

export default SubmissionYourInformation;

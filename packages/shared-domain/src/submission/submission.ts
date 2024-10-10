import SubmissionAddress from './address';
import SubmissionIdentity from './identity';

interface SubmissionDefault {
  [key: string]: any;
  dineOpplysninger?: SubmissionYourInformation;
}

interface SubmissionYourInformation {
  fornavn?: string;
  etternavn?: string;
  identitet?: SubmissionIdentity;
  adresse?: SubmissionAddress;
}

export default SubmissionDefault;

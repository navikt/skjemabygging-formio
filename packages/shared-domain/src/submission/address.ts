import Address from '../address/address';

interface SubmissionAddress extends Address {
  borDuINorge?: string;
  vegadresseEllerPostboksadresse?: string;
}

export default SubmissionAddress;

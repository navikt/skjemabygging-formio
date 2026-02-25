import { Address } from '../address';

interface SubmissionAddress extends Address {
  borDuINorge?: string;
  vegadresseEllerPostboksadresse?: string;
}

export type { SubmissionAddress };

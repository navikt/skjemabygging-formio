import { CoverPageDownloadType } from '@navikt/skjemadigitalisering-shared-domain';

type SubsequentSubmissionUser =
  | {
      collection: 'identified-person';
      user: Extract<CoverPageDownloadType['user'], { nationalIdentityNumber: string }>;
    }
  | {
      collection: 'unidentified-person';
      user: Extract<CoverPageDownloadType['user'], { firstName: string }>;
    }
  | {
      collection: 'authorized-no-user';
      reason: 'hidden' | 'forced-unit' | 'multiple-people';
      user?: never;
    };

type SubsequentSubmissionCoverPageData = Omit<CoverPageDownloadType, 'type' | 'user'> & {
  type: 'ETTERSENDELSE';
} & SubsequentSubmissionUser;

export type { SubsequentSubmissionCoverPageData, SubsequentSubmissionUser };

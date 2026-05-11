import { SubmissionType } from '../form';
import { Form } from '../forms-api-form';
import { TranslationLang } from '../translation';

type CoverPageType = 'SKJEMA' | 'ETTERSENDELSE' | 'LOESPOST';

interface NationalIdentityNumberType {
  nationalIdentityNumber: string;
  organizationNumber?: never;
  firstName?: never;
  surname?: never;
  address?: never;
}

interface OrganizationNumberType {
  nationalIdentityNumber?: never;
  organizationNumber: string;
  firstName?: never;
  surname?: never;
  address?: never;
}

interface UnknownUser {
  nationalIdentityNumber?: never;
  firstName: string;
  surname: string;
  address: {
    co?: string;
    postOfficeBox?: string;
    streetAddress?: string;
    building?: string;
    postalCode?: string;
    postalName?: string;
    region?: string;
    country?: {
      value: string;
      label: string;
    };
  };
}

type UserType = NationalIdentityNumberType | OrganizationNumberType | UnknownUser;

interface RecipientNavUnitType {
  navUnit: string;
  name?: never;
  postOfficeBox?: never;
  streetAddress?: never;
  postalCode?: never;
  postalName?: never;
}

interface RecipientAddressType {
  navUnit?: never;
  name: string;
  postOfficeBox: string;
  postalCode: string;
  postalName: string;
}

type RecipientType = RecipientNavUnitType | RecipientAddressType;

interface CoverPageDownloadType {
  type?: CoverPageType;
  submissionType: SubmissionType;
  languageCode: TranslationLang;
  form: Pick<Form, 'title' | 'skjemanummer' | 'properties'>;
  user: UserType;
  recipient?: RecipientType;
  attachments: string[];
}

export type { CoverPageDownloadType, CoverPageType };

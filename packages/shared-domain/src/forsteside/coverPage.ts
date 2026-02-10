import { Form } from '../forms-api-form';
import { TranslationLang } from '../translations/FormsApiTranslation';
import { ForstesideType } from './index';

interface NationalIdentityNumberType {
  nationalIdentityNumber: string;
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

type UserType = NationalIdentityNumberType | UnknownUser;

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

interface CoverPageType {
  type?: ForstesideType;
  languageCode: TranslationLang;
  form: Form;
  user: UserType;
  recipient?: RecipientType;
  attachments: string[];
}

export type { CoverPageType };

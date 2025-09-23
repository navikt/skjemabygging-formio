import { PhoneNumberObject } from '../../formio/components/core/phone-number/PhoneNumber';
import PhoneNumber from './PhoneNumber';

export function getInitialPhoneNumber(value: string | PhoneNumberObject, showAreaCode: boolean): PhoneNumber | string {
  if (showAreaCode) {
    return {
      areaCode: '+47',
      number: typeof value === 'object' && value ? (value.number ?? '') : '',
    };
  }
  return typeof value === 'string' ? value : '';
}

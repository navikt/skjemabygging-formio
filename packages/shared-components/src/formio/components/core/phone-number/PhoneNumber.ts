import FormioPhoneNumber from 'formiojs/components/phonenumber/PhoneNumber';
import phoneNumberForm from './PhoneNumber.form';

class PhoneNumber extends FormioPhoneNumber {
  static editForm() {
    return phoneNumberForm();
  }
}

export default PhoneNumber;

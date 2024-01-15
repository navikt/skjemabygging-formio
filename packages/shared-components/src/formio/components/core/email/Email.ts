import FormioEmail from 'formiojs/components/email/Email';
import emailForm from './Email.form';

class Email extends FormioEmail {
  static editForm() {
    return emailForm();
  }
}

export default Email;

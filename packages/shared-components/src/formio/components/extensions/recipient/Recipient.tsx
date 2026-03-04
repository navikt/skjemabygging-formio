import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import recipientBuilder from './Recipient.builder';
import recipientForm from './Recipient.form';

import NavRecipient from '../../../../components/recipient/Recipient';
import AdditionalDescription from '../../base/components/AdditionalDescription';

class Recipient extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Mottaker',
      type: 'recipient',
      spellcheck: false,
      labels: {
        nationalIdentityNumber: 'Representantens fødselsnummer eller d-nummer',
        firstName: 'Representantens fornavn',
        surname: 'Representantens etternavn',
        organization: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
        organizationName: 'Virksomhetens navn',
      },
    });
  }

  static editForm() {
    return recipientForm();
  }
  static get builderInfo() {
    return recipientBuilder();
  }

  renderReact(element) {
    element.render(
      <ComponentUtilsProvider component={this}>
        <NavRecipient />
        <AdditionalDescription component={this.component} />
      </ComponentUtilsProvider>,
    );
  }
}

export default Recipient;

import { BodyShort } from '@navikt/ds-react';
import BaseComponent from '../../base/BaseComponent';
import addressBuilder from './Address.builder';
import addressForm from './Address.form';

class Address extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Folkeregistrert adresse',
      type: 'navAddress',
      key: 'folkeregistrertAdresse',

      hidden: true,
      hideLabel: true,
      clearOnHide: false,
    });
  }

  static editForm() {
    return addressForm();
  }

  static get builderInfo() {
    return addressBuilder();
  }

  renderReact(element) {
    if (this.builderMode) {
      element.render(
        <BodyShort>{'Denne komponenten er skjult for brukeren, men vises på oppsummeringssiden og i PDF'}</BodyShort>,
      );
    }
  }
}

export default Address;

import BaseComponent from '../../../base/BaseComponent';

class OtherAttachment extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Annen dokumentasjon',
      description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
      type: 'attachment',
      key: 'annenDokumentasjon',
      dataSrc: 'values',
    });
  }
}

export default OtherAttachment;

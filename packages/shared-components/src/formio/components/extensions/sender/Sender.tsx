import { SubmissionSender } from '@navikt/skjemadigitalisering-shared-domain';
import NavSender from '../../../../components/Sender/Sender';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import senderBuilder from './Sender.builder';
import senderForm from './Sender.form';

class Sender extends BaseComponent {
  constructor(...args: any[]) {
    // @ts-expect-error args
    super(...args);
    this.noMainRef();
  }

  static schema() {
    return BaseComponent.schema({
      label: 'Avsender',
      type: 'sender',
      spellcheck: false,
      hideLabel: true,
    });
  }

  static editForm() {
    return senderForm();
  }

  static get builderInfo() {
    return senderBuilder();
  }

  init() {
    super.init();
    this.initPrefill();
  }

  initPrefill() {
    if (this.hasPrefill() && this.component?.prefillValue) {
      const value: SubmissionSender = {
        person: {
          nationalIdentityNumber: this.component?.prefillValue['sokerIdentifikasjonsnummer'],
          firstName: this.component?.prefillValue['sokerFornavn'],
          surname: this.component?.prefillValue['sokerEtternavn'],
        },
      };
      super.setValue(value);
    }
  }

  getReadOnly() {
    return this.hasPrefill() || super.getReadOnly();
  }

  handleChange(value: SubmissionSender) {
    super.handleChange(value);
    this.rerender();
  }

  renderReact(element) {
    element.render(
      <ComponentUtilsProvider component={this}>
        <NavSender
          role={this.component?.senderRole ?? 'person'}
          labels={this.component?.labels ?? {}}
          descriptions={this.component?.descriptions ?? {}}
          value={this.getValue()}
          onChange={this.handleChange.bind(this)}
          readOnly={this.getReadOnly()}
          fieldSize={this.getFieldSize()}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default Sender;

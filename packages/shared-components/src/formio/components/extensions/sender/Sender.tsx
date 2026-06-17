import { SubmissionSender, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import NavSender from '../../../../components/Sender/Sender';
import { validateNationalIdentityNumber } from '../../../../components/identity/NationalIdentityNumberValidator';
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
  }

  private applyPrefillIfVisible() {
    if (
      !this.hasPrefill() ||
      !this.component?.prefillValue ||
      this.visible === false ||
      this.hasValue() ||
      this.getSenderRole() !== 'person'
    ) {
      return undefined;
    }

    super.setValue({
      person: {
        nationalIdentityNumber: this.component?.prefillValue['sokerIdentifikasjonsnummer'],
        firstName: this.component?.prefillValue['sokerFornavn'],
        surname: this.component?.prefillValue['sokerEtternavn'],
      },
    });
  }

  getReadOnly() {
    return this.hasPrefill() || super.getReadOnly();
  }

  handleChange(value: SubmissionSender) {
    super.handleChange(value);
    this.rerender();
  }

  checkComponentValidity(data, dirty, row, _options = {}) {
    this.removeAllErrors();

    if (this.shouldSkipValidation(data, dirty, row) || this.getReadOnly()) {
      return true;
    }

    const sender: SubmissionSender = this.getValue() ?? {};
    this.validateRequiredFields(sender);
    this.validateFieldValues(sender);

    this.rerender();

    return this.componentErrors.length === 0;
  }

  private getSenderRole() {
    return this.component?.senderRole ?? 'person';
  }

  private validateRequiredFields(sender: SubmissionSender) {
    if (!this.isRequired()) {
      return;
    }

    const customLabels = this.getCustomLabels()!;

    if (this.getSenderRole() === 'organization') {
      this.validateRequiredField(sender.organization?.number, 'organizationNumber', customLabels.organizationNumber);
      this.validateRequiredField(sender.organization?.name, 'organizationName', customLabels.organizationName);
      return;
    }

    this.validateRequiredField(
      sender.person?.nationalIdentityNumber,
      'nationalIdentityNumber',
      customLabels.nationalIdentityNumber,
    );
    this.validateRequiredField(sender.person?.firstName, 'firstName', customLabels.firstName);
    this.validateRequiredField(sender.person?.surname, 'surname', customLabels.surname);
  }

  private validateFieldValues(sender: SubmissionSender) {
    const customLabels = this.getCustomLabels()!;

    if (this.getSenderRole() === 'organization') {
      this.validateOrganizationNumber(sender.organization?.number);
      this.validateTextInput(sender.organization?.name, 'organizationName', customLabels.organizationName);
      return;
    }

    this.validateNationalIdentityNumber(sender.person?.nationalIdentityNumber);
    this.validateTextInput(sender.person?.firstName, 'firstName', customLabels.firstName);
    this.validateTextInput(sender.person?.surname, 'surname', customLabels.surname);
  }

  private validateRequiredField(value: string | undefined, field: string, label: string) {
    if (!value) {
      super.addError(this.translate('required', { field: this.translate(label) }), `sender:${field}`);
    }
  }

  private validateTextInput(value: string | undefined, field: string, label: string) {
    if (!validatorUtils.isValidCoverPageValue(value ?? '')) {
      super.addError(this.translate('containsInvalidCharacters', { field: this.translate(label) }), `sender:${field}`);
    }
  }

  private validateNationalIdentityNumber(value: string | undefined) {
    const errorMessage = validateNationalIdentityNumber(
      {
        value: value ?? '',
        allowTestTypes: this.getAppConfig().config?.NAIS_CLUSTER_NAME !== 'prod-gcp',
      },
      this.translate.bind(this),
    );

    if (errorMessage) {
      super.addError(errorMessage, 'sender:nationalIdentityNumber');
    }
  }

  private validateOrganizationNumber(value: string | undefined) {
    if (value && !validatorUtils.isOrganizationNumber(value)) {
      super.addError(this.translate('orgNrCustomError'), 'sender:organizationNumber');
    }
  }

  renderReact(element) {
    this.applyPrefillIfVisible();

    element.render(
      <ComponentUtilsProvider component={this}>
        <NavSender
          role={this.component?.senderRole ?? 'person'}
          customLabels={this.getCustomLabels() ?? {}}
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

import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { toAccountNumberValidation } from '../../components/account-number/AccountNumber';
import { toActivitiesValidationFields } from '../../components/activities/activitiesValidation';
import { toAddressValidityValidationFields } from '../../components/address-validity/addressValidityValidation';
import { toAddressValidationFields } from '../../components/address/addressValidation';
import { getDataFetcherData, toSelectedValuesList } from '../../components/data-fetcher/dataFetcherUtils';
import { toDataFetcherValidationFields } from '../../components/data-fetcher/dataFetcherValidation';
import { toDatePickerValidation, toMonthPickerValidation } from '../../components/date/dateValidation';
import { toDrivingListValidationFields } from '../../components/driving-list/drivingListValidation';
import { toEmailValidation } from '../../components/email/Email';
import { toIbanValidation } from '../../components/iban/Iban';
import { toIdentityValidationFields } from '../../components/identity/identityValidation';
import { toNationalIdentityNumberValidation } from '../../components/national-identity-number/NationalIdentityNumber';
import { toNumberFieldValidation } from '../../components/number-field/NumberField';
import { toOrganizationNumberValidation } from '../../components/organization-number/OrganizationNumber';
import { toPhoneNumberValidationFields } from '../../components/phone-number/phoneNumberValidation';
import { toSenderValidationFields } from '../../components/sender/senderValidation';
import {
  FieldValidationInput,
  toChoiceFieldValidation,
  toFieldValidation,
  toValidationFields,
} from '../../components/shared/fieldValidation';
import { toCoverPageTextFieldValidation, toTextFieldValidation } from '../../components/text-field/textFieldValidation';
import { toYearValidation } from '../../components/year/Year';
import {
  enrichComponentsWithBaseSubmissionPath,
  toComponentDefinitions,
} from '../../context/form-definition/formDefinitionUtils';
import { getActiveRowComponents, getDataGridRows, getRenderedDataGridRows } from '../components/data-grid/dataGridRows';
import { resolveCustomValidationRules } from '../custom-validation/customValidationRules';
import {
  getDatePickerFromDate,
  getDatePickerToDate,
  getMonthPickerMaxYear,
  getMonthPickerMinYear,
} from '../dateDefinitionUtils';
import { getValues, isRequired, resolveValidation } from '../inputComponentRegistryUtils';
import { ValidationFieldsBuilder, ValidationFieldsContext, ValidationFieldsRegistry } from './validationFieldsTypes';

/**
 * The label and authored constraints an input adapter passes to its reusable component, including
 * the value rules a recognized legacy `validate.custom` was replaced by. The rendered adapters
 * build the same object through `useResolvedValidation`, from the same two functions.
 */
const toFieldValidationInput = (context: ValidationFieldsContext): FieldValidationInput => ({
  statePath: context.submissionPath,
  label: context.component.label,
  required: isRequired(context.component),
  validation: {
    ...resolveValidation(context.component),
    ...resolveCustomValidationRules(context.component, context),
  },
});

const noValidationFields: ValidationFieldsBuilder = () => [];

const childValidationFields: ValidationFieldsBuilder = ({ component, collectChildren }) =>
  collectChildren(toComponentDefinitions(component.components ?? []));

const numberType = (component: Component): Parameters<typeof toNumberFieldValidation>[1] =>
  component.inputType === 'numeric' ? 'integer' : 'decimal';

const plainValidationFields: ValidationFieldsBuilder = (context) =>
  toValidationFields(context.submissionPath, context.value, toFieldValidation(toFieldValidationInput(context)));

/** Select boxes store a map of options, but are validated on the list of chosen ones. */
const selectBoxesValidationFields: ValidationFieldsBuilder = (context) =>
  toValidationFields(
    context.submissionPath,
    toSelectedValuesList(context.value ?? context.component.defaultValue),
    toFieldValidation(toFieldValidationInput(context)),
  );

const choiceValidationFields: ValidationFieldsBuilder = (context) =>
  toValidationFields(
    context.submissionPath,
    context.value,
    toChoiceFieldValidation(
      toFieldValidationInput(context),
      getValues(context.component),
      context.component.validate?.onlyAvailableItems,
    ),
  );

/**
 * Rebuilds a page's validated fields without rendering it. Each entry mirrors the props its input
 * adapter passes and then delegates to the same component-owned builder, which describes the fields
 * the rendered inputs register - one per state path, composites included - so every rule exists in
 * exactly one place.
 */
const validationFieldsRegistry: ValidationFieldsRegistry = {
  accordion: noValidationFields,
  alertstripe: noValidationFields,
  htmlelement: noValidationFields,
  image: noValidationFields,
  maalgruppe: noValidationFields,

  container: childValidationFields,
  fieldset: childValidationFields,
  navSkjemagruppe: childValidationFields,
  row: childValidationFields,

  textfield: (context) =>
    toValidationFields(context.submissionPath, context.value, toTextFieldValidation(toFieldValidationInput(context))),
  email: (context) =>
    toValidationFields(context.submissionPath, context.value, toEmailValidation(toFieldValidationInput(context))),
  firstName: (context) =>
    toValidationFields(
      context.submissionPath,
      context.value,
      toCoverPageTextFieldValidation(toFieldValidationInput(context)),
    ),
  surname: (context) =>
    toValidationFields(
      context.submissionPath,
      context.value,
      toCoverPageTextFieldValidation(toFieldValidationInput(context)),
    ),
  bankAccount: (context) =>
    toValidationFields(
      context.submissionPath,
      context.value,
      toAccountNumberValidation(toFieldValidationInput(context)),
    ),
  iban: (context) =>
    toValidationFields(context.submissionPath, context.value, toIbanValidation(toFieldValidationInput(context))),
  orgNr: (context) =>
    toValidationFields(
      context.submissionPath,
      context.value,
      toOrganizationNumberValidation(toFieldValidationInput(context)),
    ),
  fnrfield: (context) =>
    toValidationFields(
      context.submissionPath,
      context.value,
      toNationalIdentityNumberValidation(toFieldValidationInput(context)),
    ),
  year: (context) =>
    toValidationFields(context.submissionPath, context.value, toYearValidation(toFieldValidationInput(context))),
  number: (context) =>
    toValidationFields(
      context.submissionPath,
      context.value,
      toNumberFieldValidation(toFieldValidationInput(context), numberType(context.component)),
    ),
  currency: (context) =>
    toValidationFields(
      context.submissionPath,
      context.value,
      toNumberFieldValidation(toFieldValidationInput(context), numberType(context.component)),
    ),

  textarea: plainValidationFields,
  navCheckbox: plainValidationFields,
  selectboxes: selectBoxesValidationFields,
  landvelger: plainValidationFields,
  valutavelger: plainValidationFields,
  attachment: plainValidationFields,

  select: choiceValidationFields,
  navSelect: choiceValidationFields,
  radiopanel: choiceValidationFields,

  navDatepicker: (context) =>
    toValidationFields(
      context.submissionPath,
      context.value,
      toDatePickerValidation({
        ...toFieldValidationInput(context),
        fromDate: getDatePickerFromDate(context.component, context.pageComponents, context.submission),
        toDate: getDatePickerToDate(context.component),
      }),
    ),

  monthPicker: (context) =>
    toValidationFields(
      context.submissionPath,
      context.value,
      toMonthPickerValidation({
        ...toFieldValidationInput(context),
        minYear: getMonthPickerMinYear(context.component),
        maxYear: getMonthPickerMaxYear(context.component),
      }),
    ),

  phoneNumber: (context) =>
    toPhoneNumberValidationFields({
      ...toFieldValidationInput(context),
      showAreaCode: context.component.showAreaCode,
      value: context.value as Parameters<typeof toPhoneNumberValidationFields>[0]['value'],
    }),

  drivinglist: ({ submissionPath, value, submissionMethod }) =>
    toDrivingListValidationFields({
      statePath: submissionPath,
      value: value as Parameters<typeof toDrivingListValidationFields>[0]['value'],
      submissionMethod,
    }),

  identity: ({ component, submissionPath, value }) =>
    toIdentityValidationFields({
      statePath: submissionPath,
      required: component.validate?.required ?? true,
      readOnly: component.readOnly,
      customLabels: component.customLabels,
      value: value as Parameters<typeof toIdentityValidationFields>[0]['value'],
    }),

  navAddress: ({ component, submissionPath, value, submissionMethod, currentLanguage }) =>
    toAddressValidationFields({
      statePath: submissionPath,
      addressPriority: component.addressPriority,
      addressType: component.addressType,
      addressTypeWizard: component.addressTypeWizard,
      prefillKey: component.prefillKey,
      prefillValue: component.prefillValue,
      customLabels: component.customLabels,
      required: isRequired(component),
      readOnly: component.readOnly,
      value: value as Parameters<typeof toAddressValidationFields>[0]['value'],
      submissionMethod,
      currentLanguage,
    }),

  addressValidity: ({ component, submissionPath, value }) =>
    toAddressValidityValidationFields({
      statePath: submissionPath,
      required: isRequired(component),
      value: value as Parameters<typeof toAddressValidityValidationFields>[0]['value'],
    }),

  sender: ({ component, submissionPath, value }) =>
    toSenderValidationFields({
      statePath: submissionPath,
      required: isRequired(component),
      senderRole: component.senderRole,
      customLabels: component.customLabels,
      value: value as Parameters<typeof toSenderValidationFields>[0]['value'],
      prefillValue:
        typeof component.prefillValue === 'object' && component.prefillValue !== null
          ? (component.prefillValue as Parameters<typeof toSenderValidationFields>[0]['prefillValue'])
          : undefined,
    }),

  activities: ({ component, submissionPath, value, submissionMethod }) =>
    toActivitiesValidationFields({ statePath: submissionPath, label: component.label, value, submissionMethod }),

  dataFetcher: ({ component, submissionPath, value, submission, submissionMethod }) =>
    submissionMethod === 'digital'
      ? toDataFetcherValidationFields({
          statePath: submissionPath,
          label: component.label ?? 'Datahenter',
          required: isRequired(component),
          values: getDataFetcherData(submissionPath, submission)?.data ?? [],
          value,
        })
      : [],

  // Mirrors InputDataGrid: an empty grid still renders one row unless it opted out, and every row
  // resolves its conditionals against the row data.
  datagrid: ({ component, submissionPath, submission, submissionMethod, form, collectChildren }) =>
    component.components?.length
      ? getRenderedDataGridRows(getDataGridRows(component, submission), component.initEmpty).flatMap((row, index) =>
          collectChildren(
            getActiveRowComponents(
              toComponentDefinitions(
                enrichComponentsWithBaseSubmissionPath(component.components ?? [], `${submissionPath}[${index}]`),
              ),
              row,
              submission?.data,
              form,
              submissionMethod,
            ),
          ),
        )
      : [],
};

export { toFieldValidationInput, validationFieldsRegistry };

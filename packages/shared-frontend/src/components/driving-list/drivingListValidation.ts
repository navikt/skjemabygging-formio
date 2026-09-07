import { DrivingListSubmission, SubmissionMethod, TEXTS, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationField } from '../../context/validation/validationTypes';
import { toDatePickerValidation } from '../date/dateValidation';
import { toFieldValidation, toValidationFields } from '../shared/fieldValidation';
import { FieldValidationProp } from '../types';
import { allPaperFieldsForPeriodsAreSet, normalizeSubmissionDate } from './drivingListUtils';

interface DrivingListValidationInput {
  statePath: string;
  value?: DrivingListSubmission;
  submissionMethod?: SubmissionMethod;
}

/** The expense of a single day is checked against the day it was entered for. */
const toParkingExpenseRules = (date: string, enforceMaxHundred: boolean): FieldValidationProp => ({
  drivingListParkingExpense: { date, enforceMaxHundred },
});

/**
 * The days are only asked for once the answers they depend on are given: the period the paper list
 * covers, or the decision the digital list is written for.
 */
const shouldSelectDates = (value?: DrivingListSubmission, submissionMethod?: SubmissionMethod) =>
  submissionMethod === 'paper'
    ? allPaperFieldsForPeriodsAreSet(normalizeSubmissionDate(value?.selectedDate), value?.parking)
    : submissionMethod === 'digital' && !!value?.selectedVedtaksId;

/**
 * The fields a driving list validates. The days are picked in several period accordions at once, so
 * the list declares them itself (see `ValidationRegistration`); everything else is registered by the
 * input that renders it, and this builder mirrors those inputs for the headless page rebuild.
 */
const toDrivingListValidationFields = ({
  statePath,
  value,
  submissionMethod,
}: DrivingListValidationInput): ValidationField[] => {
  const datesPath = `${statePath}.dates`;
  const fields: ValidationField[] = [];

  if (submissionMethod === 'paper') {
    const selectedDatePath = `${statePath}.selectedDate`;
    const parkingPath = `${statePath}.parking`;
    fields.push(
      ...toValidationFields(
        selectedDatePath,
        value?.selectedDate,
        toDatePickerValidation({
          statePath: selectedDatePath,
          label: TEXTS.statiske.drivingList.datePicker,
          required: true,
          toDate: dateUtils.toSubmissionDate(),
        }),
      ),
      ...toValidationFields(
        parkingPath,
        value?.parking,
        toFieldValidation({ statePath: parkingPath, label: TEXTS.statiske.drivingList.parking, required: true }),
      ),
    );
  } else if (submissionMethod === 'digital') {
    const selectedVedtaksIdPath = `${statePath}.selectedVedtaksId`;
    fields.push(
      ...toValidationFields(
        selectedVedtaksIdPath,
        value?.selectedVedtaksId,
        toFieldValidation({ statePath: selectedVedtaksIdPath, label: TEXTS.statiske.activities.label, required: true }),
      ),
    );
  }

  if (shouldSelectDates(value, submissionMethod)) {
    fields.push(
      ...toValidationFields(
        datesPath,
        value?.dates,
        toFieldValidation({ statePath: datesPath, label: TEXTS.statiske.drivingList.dateSelect, required: true }),
      ),
    );
  }

  // Every day the user picked can hold an expense. A day whose expense input is not rendered has no
  // expense either, so the rule simply never fires for it.
  (value?.dates ?? []).forEach((dateEntry, index) => {
    const parkingExpensePath = `${datesPath}[${index}].parking`;
    fields.push(
      ...toValidationFields(
        parkingExpensePath,
        dateEntry.parking,
        toFieldValidation({
          statePath: parkingExpensePath,
          label: TEXTS.statiske.drivingList.parkingExpenses,
          required: false,
          validation: toParkingExpenseRules(dateEntry.date, submissionMethod === 'digital'),
        }),
      ),
    );
  });

  return fields;
};

export { toDrivingListValidationFields, toParkingExpenseRules };
export type { DrivingListValidationInput };

import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

interface DatePickerValidationInput extends FieldValidationInput {
  fromDate?: string;
  toDate?: string;
}

interface MonthPickerValidationInput extends FieldValidationInput {
  minYear?: number;
  maxYear?: number;
}

const toDatePickerValidation = ({ fromDate, toDate, ...input }: DatePickerValidationInput) =>
  toFieldValidation(input, { date: true, fromDate, toDate });

const toMonthPickerValidation = ({ minYear, maxYear, ...input }: MonthPickerValidationInput) =>
  toFieldValidation(input, { month: true, monthMinYear: minYear, monthMaxYear: maxYear });

export { toDatePickerValidation, toMonthPickerValidation };
export type { DatePickerValidationInput, MonthPickerValidationInput };

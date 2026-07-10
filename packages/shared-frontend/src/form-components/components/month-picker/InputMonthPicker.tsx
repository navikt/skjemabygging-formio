import { getMonthPickerMaxYear, getMonthPickerMinYear } from '../../../components/date/dateFieldUtils';
import MonthPicker from '../../../components/date/MonthPicker';
import { InputComponentProps, isRequired, resolveSubmissionPath } from '../../inputComponentRegistryUtils';

const InputMonthPicker = ({ component, submissionPath }: InputComponentProps) => (
  <MonthPicker
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    readOnly={component.readOnly}
    minYear={getMonthPickerMinYear(component)}
    maxYear={getMonthPickerMaxYear(component)}
  />
);

export default InputMonthPicker;

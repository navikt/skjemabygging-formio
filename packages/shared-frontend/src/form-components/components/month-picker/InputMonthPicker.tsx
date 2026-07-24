import { getMonthPickerMaxYear, getMonthPickerMinYear } from '../../../components/date/dateFieldUtils';
import MonthPicker from '../../../components/date/MonthPicker';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputMonthPicker = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <MonthPicker
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      readOnly={component.readOnly}
      minYear={getMonthPickerMinYear(component)}
      maxYear={getMonthPickerMaxYear(component)}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputMonthPicker;

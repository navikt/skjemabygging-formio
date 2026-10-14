import MonthPicker from '../../../components/date/MonthPicker';
import { MonthPickerDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import { getMonthPickerMaxYear, getMonthPickerMinYear } from '../../dateDefinitionUtils';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const InputMonthPicker = ({ component, submissionPath }: InputComponentProps<MonthPickerDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <MonthPicker
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      minYear={getMonthPickerMinYear(component)}
      maxYear={getMonthPickerMaxYear(component)}
      readMore={resolveReadMore(component)}
      validation={validation}
    />
  );
};

export default InputMonthPicker;

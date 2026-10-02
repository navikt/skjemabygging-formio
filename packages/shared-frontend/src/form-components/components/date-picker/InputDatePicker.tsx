import DatePicker from '../../../components/date/DatePicker';
import { useFormDefinitionForm } from '../../../context/form-definition/FormDefinitionContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { DatePickerDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import { getDatePickerFromDate, getDatePickerToDate } from '../../dateDefinitionUtils';
import { InputComponentProps, isRequired, resolveReadMore, resolveSubmissionPath } from '../../inputComponentUtils';

const InputDatePicker = ({ component, submissionPath }: InputComponentProps<DatePickerDefinition>) => {
  const { submission } = useSubmissionState();
  const form = useFormDefinitionForm();
  const statePath = resolveSubmissionPath(component, submissionPath);
  const validation = useResolvedValidation(component);

  // Legacy date inputs ignored fieldSize; preserve their natural width for existing forms.
  return (
    <DatePicker
      statePath={statePath}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      readOnly={component.readOnly}
      fromDate={getDatePickerFromDate(component, form.components, submission)}
      toDate={getDatePickerToDate(component)}
      readMore={resolveReadMore(component)}
      validation={validation}
    />
  );
};

export default InputDatePicker;

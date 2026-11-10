import { useMemo } from 'react';
import DatePicker from '../../../components/date/DatePicker';
import { useFormDefinitionForm } from '../../../context/form-definition/FormDefinitionContext';
import { useFieldStateValue } from '../../../context/state/StateContext';
import { useSubmissionActions } from '../../../context/state/SubmissionStateContext';
import { DatePickerDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  getBeforeDateInputSubmissionPath,
  getDatePickerFromDate,
  getDatePickerToDate,
} from '../../dateDefinitionUtils';
import { InputComponentProps, isRequired, resolveReadMore, resolveSubmissionPath } from '../../inputComponentUtils';

const InputDatePicker = ({ component, submissionPath }: InputComponentProps<DatePickerDefinition>) => {
  const { getLatestSubmission } = useSubmissionActions();
  const form = useFormDefinitionForm();
  const statePath = resolveSubmissionPath(component, submissionPath);
  const validation = useResolvedValidation(component);
  const beforeDateInputPath = useMemo(
    () => getBeforeDateInputSubmissionPath(component, form.components),
    [component, form.components],
  );
  // The start date is the only answer `fromDate` reads, so only a change there rerenders the picker.
  useFieldStateValue(beforeDateInputPath ?? '', beforeDateInputPath !== undefined);

  // Legacy date inputs ignored fieldSize; preserve their natural width for existing forms.
  return (
    <DatePicker
      statePath={statePath}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      readOnly={component.readOnly}
      fromDate={getDatePickerFromDate(component, form.components, getLatestSubmission())}
      toDate={getDatePickerToDate(component)}
      readMore={resolveReadMore(component)}
      validation={validation}
    />
  );
};

export default InputDatePicker;

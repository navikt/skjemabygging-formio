import { useEffect, useMemo } from 'react';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useStateField } from '../../context/state/useStateField';

interface HiddenComputedFieldProps<TValue> {
  statePath: string;
  computeValue: (args: { submissionData: object; currentValue?: TValue }) => TValue;
  equals?: (left?: TValue, right?: TValue) => boolean;
}

const defaultEquals = <TValue,>(left?: TValue, right?: TValue) => JSON.stringify(left) === JSON.stringify(right);

const HiddenComputedField = <TValue,>({
  statePath,
  computeValue,
  equals = defaultEquals,
}: HiddenComputedFieldProps<TValue>) => {
  const { submission } = useSubmissionState();
  const { stateValue, setStateValue } = useStateField({ statePath });
  const currentValue = stateValue as TValue | undefined;
  const nextValue = useMemo(
    () => computeValue({ submissionData: submission?.data ?? {}, currentValue }),
    [computeValue, currentValue, submission?.data],
  );

  useEffect(() => {
    if (!equals(currentValue, nextValue)) {
      setStateValue(nextValue);
    }
  }, [currentValue, equals, nextValue, setStateValue]);

  return null;
};

export default HiddenComputedField;
export type { HiddenComputedFieldProps };

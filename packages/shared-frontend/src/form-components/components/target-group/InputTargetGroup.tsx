import { SubmissionMaalgruppe as SubmissionTargetGroup } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useFieldBinding } from '../../../context/state/useFieldBinding';
import { TargetGroupDefinition } from '../../component-types';
import { InputComponentProps, resolveSubmissionPath } from '../../inputComponentUtils';
import { calculateTargetGroupValue, isSendInnTargetGroup, targetGroupValuesEqual } from './targetGroupUtils';

const InputTargetGroup = ({ component, submissionPath }: InputComponentProps<TargetGroupDefinition>) => {
  const statePath = resolveSubmissionPath(component, submissionPath);
  const { submission } = useSubmissionState();
  const { stateValue, setStateValue } = useFieldBinding({ statePath });
  const currentValue = stateValue as SubmissionTargetGroup | undefined;
  const prefilledValue = isSendInnTargetGroup(component.prefillValue) ? component.prefillValue : undefined;
  const nextValue = useMemo(
    () => calculateTargetGroupValue(submission?.data ?? {}, currentValue, prefilledValue),
    [currentValue, prefilledValue, submission?.data],
  );

  useEffect(() => {
    if (!targetGroupValuesEqual(currentValue, nextValue)) {
      setStateValue(nextValue);
    }
  }, [currentValue, nextValue, setStateValue]);

  return null;
};

export default InputTargetGroup;

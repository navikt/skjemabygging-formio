import { TEXTS, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NavUnitLookupFeedback } from '../../../components/nav-unit-select/NavUnitLookupFeedback';
import { useNavUnits } from '../../../components/nav-unit-select/useNavUnits';
import { NavUnitSelectDefinition } from '../../component-types';
import { DefaultAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryNavUnitSelect = (props: FormComponentProps<NavUnitSelectDefinition>) => {
  const { availableUnits, error, retry } = useNavUnits({ unitTypes: props.component.unitTypes });
  const value = submissionUtils.getSubmissionValue(props.submissionPath, props.submission);
  if (!value) return null;
  const selectedUnit = availableUnits?.find((unit) => unit.enhetNr === value);
  const unavailable = !!error || (availableUnits !== undefined && !selectedUnit);

  return (
    <>
      <DefaultAnswer
        {...props}
        valueFormat={() =>
          selectedUnit?.navn ??
          props.translate(unavailable ? TEXTS.statiske.navUnit.fetchError : TEXTS.statiske.loading)
        }
      />
      {unavailable && <NavUnitLookupFeedback retry={retry} />}
    </>
  );
};

export default SummaryNavUnitSelect;

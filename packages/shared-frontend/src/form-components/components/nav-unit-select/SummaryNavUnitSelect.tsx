import { FormSummary } from '@navikt/ds-react';
import { TEXTS, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NavUnitLookupFeedback } from '../../../components/nav-unit-select/NavUnitLookupFeedback';
import { useNavUnits } from '../../../components/nav-unit-select/useNavUnits';
import { NavUnitSelectDefinition } from '../../component-types';
import { DefaultLabel } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryNavUnitSelect = (props: FormComponentProps<NavUnitSelectDefinition>) => {
  const { availableUnits, error, retry } = useNavUnits({ unitTypes: props.component.unitTypes });
  const value = submissionUtils.getSubmissionValue(props.submissionPath, props.submission);
  if (!value) return null;
  const selectedUnit = availableUnits?.find((unit) => unit.enhetNr === value);
  const unavailable = !!error || (availableUnits !== undefined && !selectedUnit);

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>
        {unavailable ? (
          <NavUnitLookupFeedback retry={retry} />
        ) : (
          (selectedUnit?.navn ?? props.translate(TEXTS.statiske.loading))
        )}
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryNavUnitSelect;
